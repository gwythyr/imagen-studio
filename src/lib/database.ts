import initSqlJs, { type Database } from 'sql.js';
import { type Message, type ChatSession, type SessionStats } from '../types/chat';

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

      CREATE TABLE messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        content TEXT,
        role TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        image_data BLOB,
        audio_data BLOB
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

    this.db!.run(
      'INSERT INTO messages (id, session_id, content, role, timestamp, image_data, audio_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        fullMessage.id,
        sessionId,
        fullMessage.content || null,
        fullMessage.role,
        fullMessage.timestamp,
        fullMessage.imageData || null,
        fullMessage.audioData || null
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
    const stmt = this.db!.prepare(
      'SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC'
    );
    stmt.bind([sessionId]);

    const messages: Message[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      messages.push({
        id: row.id as string,
        content: row.content as string,
        role: row.role as 'user' | 'assistant',
        timestamp: row.timestamp as number,
        imageData: row.image_data ? new Uint8Array(row.image_data as ArrayBuffer) : undefined,
        audioData: row.audio_data ? new Uint8Array(row.audio_data as ArrayBuffer) : undefined
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
}
