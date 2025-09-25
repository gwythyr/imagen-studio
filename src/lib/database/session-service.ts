import { type ChatSession, type SessionStats } from '../../types/chat';
import { DatabaseConnection } from './connection';

export class SessionService {
  private conn: DatabaseConnection;

  constructor(conn: DatabaseConnection) {
    this.conn = conn;
  }

  async create(title: string | null): Promise<ChatSession> {
    const db = this.conn.getDb();
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    db.exec({
      sql: 'INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      bind: [session.id, session.title, session.createdAt, session.updatedAt]
    });

    return session;
  }

  async getAll(): Promise<ChatSession[]> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: 'SELECT * FROM sessions ORDER BY updated_at DESC',
      returnValue: 'resultRows',
      columnNames: true
    });

    const sessions: ChatSession[] = result.map((row: any[]) => ({
      id: row[0] as string,
      title: row[1] as string,
      createdAt: row[2] as number,
      updatedAt: row[3] as number
    }));
    return sessions;
  }

  async get(sessionId: string): Promise<ChatSession | null> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: 'SELECT * FROM sessions WHERE id = ?',
      bind: [sessionId],
      returnValue: 'resultRows',
      columnNames: true
    });

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row[0] as string,
      title: row[1] as string,
      createdAt: row[2] as number,
      updatedAt: row[3] as number
    };
  }

  async update(sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>): Promise<void> {
    if (updates.title !== undefined) {
      const db = this.conn.getDb();
      db.exec({
        sql: 'UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?',
        bind: [updates.title, Date.now(), sessionId]
      });
    }
  }

  async getStats(sessionId: string): Promise<SessionStats> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: `
        SELECT
          COUNT(*) as message_count,
          MAX(timestamp) as last_message_timestamp
        FROM messages
        WHERE session_id = ?
      `,
      bind: [sessionId],
      returnValue: 'resultRows'
    });

    const messageCount = result[0]?.[0] as number || 0;
    const lastMessageTimestamp = result[0]?.[1] as number | null;
    return {
      sessionId,
      messageCount,
      lastMessageTimestamp
    };
  }
}