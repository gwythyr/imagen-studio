import initSqlJs, { type Database } from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
import { type Message, type MessageType, type ChatSession, type SessionStats, type ImageRecord, type ImageContent } from '../types/chat';
import { type DatabaseWorkerRequest, type DatabaseWorkerResponse } from './database-types';

class DatabaseWorker {
  private db: Database | null = null;
  public initialized = false;
  private initializing = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializing) {
      // Wait for existing initialization to complete
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return;
    }

    this.initializing = true;

    try {
      // Initialize SQL.js with absurd-sql
      const SQL = await initSqlJs({
        locateFile: (file: string) => {
          if (file.endsWith('.wasm')) {
            return `${import.meta.env.BASE_URL}${file}`;
          }
          return file;
        }
      });

      // Set up absurd-sql with IndexedDB backend
      const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
      SQL.register_for_idb(sqlFS);

      // Mount the file system
      SQL.FS.mkdir('/sql');
      SQL.FS.mount(sqlFS, {}, '/sql');

      const path = '/sql/imagen-studio.sqlite';

      // Open the database
      this.db = new SQL.Database(path, { filename: true });

      // Optimize for performance
      this.db.exec(`
        PRAGMA journal_mode=MEMORY;
        PRAGMA page_size=8192;
      `);

      // Create tables if they don't exist
      await this.ensureTablesExist();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  private async ensureTablesExist(): Promise<void> {
    const tableExists = this.db!.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='sessions';
    `);

    if (tableExists.length === 0) {
      await this.createTables();
    }
  }

  private async createTables(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        data BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        filename TEXT,
        size INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        content TEXT,
        role TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        image_id TEXT,
        audio_data BLOB,
        sent_to_ai INTEGER DEFAULT 0,
        FOREIGN KEY (image_id) REFERENCES images (id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `;

    // Retry mechanism for database locks
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        this.db!.exec(sql);
        break;
      } catch (error: any) {
        attempts++;
        if (error.message?.includes('locked') && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        throw error;
      }
    }
  }


  async createSession(title: string | null): Promise<ChatSession> {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.db!.run(
      'INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [session.id, session.title, session.createdAt, session.updatedAt]
    );

    return session;
  }

  async addMessage(sessionId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const fullMessage: Message = {
      id: crypto.randomUUID(),
      ...message
    };

    let imageId: string | null = null;
    if (fullMessage.imageContent) {
      imageId = await this.createImage({
        data: fullMessage.imageContent.data,
        mimeType: fullMessage.imageContent.mimeType,
        size: fullMessage.imageContent.data.length
      });
    } else if (fullMessage.imageData) {
      imageId = await this.createImage({
        data: fullMessage.imageData,
        mimeType: 'image/jpeg',
        size: fullMessage.imageData.length
      });
    }

    const sentToAi = fullMessage.role === 'user' ? (fullMessage.sentToAi ? 1 : 0) : 1;

    // Sanitize content to prevent database corruption from null bytes and invalid Unicode
    const sanitizedContent = fullMessage.content ?
      fullMessage.content.replace(/\0/g, '').replace(/[\uFFFE\uFFFF]/g, '') : null;

    this.db!.run(
      'INSERT INTO messages (id, session_id, type, content, role, timestamp, image_id, audio_data, sent_to_ai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        fullMessage.id,
        sessionId,
        fullMessage.type,
        sanitizedContent,
        fullMessage.role,
        fullMessage.timestamp,
        imageId,
        fullMessage.audioData || null,
        sentToAi
      ]
    );

    this.db!.run(
      'UPDATE sessions SET updated_at = ? WHERE id = ?',
      [Date.now(), sessionId]
    );

    return fullMessage;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const stmt = this.db!.prepare(`
      SELECT
        m.*,
        i.data as image_data,
        i.mime_type as image_mime_type
      FROM messages m
      LEFT JOIN images i ON m.image_id = i.id
      WHERE m.session_id = ?
      ORDER BY m.timestamp ASC
    `);
    stmt.bind([sessionId]);

    const messages: Message[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();

      let imageContent: ImageContent | undefined;
      if (row.image_data && row.image_mime_type) {
        imageContent = {
          data: new Uint8Array(row.image_data as ArrayBuffer),
          mimeType: row.image_mime_type as string,
        };
      }

      messages.push({
        id: row.id as string,
        type: (row.type as MessageType) || 'text',
        content: row.content as string,
        role: row.role as 'user' | 'assistant',
        timestamp: row.timestamp as number,
        imageData: row.image_data ? new Uint8Array(row.image_data as ArrayBuffer) : undefined,
        audioData: row.audio_data ? new Uint8Array(row.audio_data as ArrayBuffer) : undefined,
        imageContent,
        sentToAi: Boolean(row.sent_to_ai)
      });
    }

    stmt.free();
    return messages;
  }

  async getSessions(): Promise<ChatSession[]> {
    const stmt = this.db!.prepare('SELECT * FROM sessions ORDER BY updated_at DESC');
    const sessions: ChatSession[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      sessions.push({
        id: row.id as string,
        title: row.title as string,
        createdAt: row.created_at as number,
        updatedAt: row.updated_at as number
      });
    }

    stmt.free();
    return sessions;
  }

  async deleteMessage(messageId: string): Promise<void> {
    this.db!.run('DELETE FROM messages WHERE id = ?', [messageId]);
  }

  async createImage(imageData: { data: Uint8Array; mimeType: string; filename?: string; size: number }): Promise<string> {
    const imageId = crypto.randomUUID();

    this.db!.run(
      'INSERT INTO images (id, data, mime_type, filename, size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        imageId,
        imageData.data,
        imageData.mimeType,
        imageData.filename || null,
        imageData.size,
        Date.now()
      ]
    );

    return imageId;
  }

  async getImage(imageId: string): Promise<ImageRecord | null> {
    const stmt = this.db!.prepare('SELECT * FROM images WHERE id = ?');
    stmt.bind([imageId]);

    let image: ImageRecord | null = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      image = {
        id: row.id as string,
        data: new Uint8Array(row.data as ArrayBuffer),
        mimeType: row.mime_type as string,
        filename: row.filename as string | null,
        size: row.size as number,
        createdAt: row.created_at as number
      };
    }

    stmt.free();
    return image;
  }

  async deleteImage(imageId: string): Promise<void> {
    this.db!.run('DELETE FROM images WHERE id = ?', [imageId]);
  }

  async getSessionStats(sessionId: string): Promise<SessionStats> {
    const stmt = this.db!.prepare(`
      SELECT
        COUNT(*) as message_count,
        MAX(timestamp) as last_message_timestamp
      FROM messages
      WHERE session_id = ?
    `);
    stmt.bind([sessionId]);

    let messageCount = 0;
    let lastMessageTimestamp = null;

    if (stmt.step()) {
      const row = stmt.getAsObject();
      messageCount = row.message_count as number;
      lastMessageTimestamp = row.last_message_timestamp as number | null;
    }

    stmt.free();
    return {
      sessionId,
      messageCount,
      lastMessageTimestamp
    };
  }

  async getSetting(key: string): Promise<string | null> {
    const stmt = this.db!.prepare('SELECT value FROM settings WHERE key = ?');
    stmt.bind([key]);

    let value: string | null = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      value = row.value as string;
    }

    stmt.free();
    return value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.db!.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  async getGeminiApiKey(): Promise<string | null> {
    return this.getSetting('gemini_api_key');
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    await this.setSetting('gemini_api_key', apiKey);
  }

  async markSessionMessagesAsSent(sessionId: string): Promise<void> {
    this.db!.run(
      'UPDATE messages SET sent_to_ai = 1 WHERE session_id = ? AND role = ?',
      [sessionId, 'user']
    );
  }

  async updateSession(sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>): Promise<void> {
    if (updates.title !== undefined) {
      this.db!.run(
        'UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?',
        [updates.title, Date.now(), sessionId]
      );
    }
  }
}

const dbWorker = new DatabaseWorker();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<DatabaseWorkerRequest>) => {
  const { id, method, params } = event.data;

  try {
    // Ensure database is initialized
    if (!dbWorker.initialized) {
      await dbWorker.initialize();
    }

    // Call the appropriate method
    const result = await (dbWorker as any)[method](...params);

    // Send success response
    const response: DatabaseWorkerResponse = { id, result };
    self.postMessage(response);
  } catch (error) {
    // Send error response
    const response: DatabaseWorkerResponse = {
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(response);
  }
};