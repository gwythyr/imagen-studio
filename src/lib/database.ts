import initSqlJs, { type Database } from 'sql.js';
import { type Message, type MessageType, type ChatSession, type SessionStats, type ImageRecord } from '../types/chat';

export class ChatDatabase {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });

    const savedDb = localStorage.getItem('chatDatabase');

    if (savedDb) {
      const buffer = new Uint8Array(JSON.parse(savedDb));
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
      this.createTables();
    }
  }

  private createTables(): void {
    this.db!.exec(`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE images (
        id TEXT PRIMARY KEY,
        data BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        filename TEXT,
        size INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE messages (
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

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    this.save();
  }


  private save(): void {
    const data = this.db!.export();
    const buffer = Array.from(data);
    localStorage.setItem('chatDatabase', JSON.stringify(buffer));
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

    this.save();
    return session;
  }

  async addMessage(sessionId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const fullMessage: Message = {
      id: crypto.randomUUID(),
      ...message
    };

    let imageId: string | null = null;
    if (fullMessage.imageData) {
      imageId = await this.createImage({
        data: fullMessage.imageData,
        mimeType: 'image/jpeg',
        size: fullMessage.imageData.length
      });
    }

    const sentToAi = fullMessage.role === 'user' ? (fullMessage.sentToAi ? 1 : 0) : 1;

    this.db!.run(
      'INSERT INTO messages (id, session_id, type, content, role, timestamp, image_id, audio_data, sent_to_ai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        fullMessage.id,
        sessionId,
        fullMessage.type,
        fullMessage.content || null,
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

    this.save();
    return fullMessage;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const stmt = this.db!.prepare(`
      SELECT
        m.*,
        i.data as image_data
      FROM messages m
      LEFT JOIN images i ON m.image_id = i.id
      WHERE m.session_id = ?
      ORDER BY m.timestamp ASC
    `);
    stmt.bind([sessionId]);

    const messages: Message[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      messages.push({
        id: row.id as string,
        type: (row.type as MessageType) || 'text',
        content: row.content as string,
        role: row.role as 'user' | 'assistant',
        timestamp: row.timestamp as number,
        imageData: row.image_data ? new Uint8Array(row.image_data as ArrayBuffer) : undefined,
        audioData: row.audio_data ? new Uint8Array(row.audio_data as ArrayBuffer) : undefined,
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
    this.save();
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
    this.save();
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
    this.save();
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
    this.save();
  }
}
