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

    db.run(
      'INSERT INTO sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [session.id, session.title, session.createdAt, session.updatedAt]
    );

    return session;
  }

  async getAll(): Promise<ChatSession[]> {
    const db = this.conn.getDb();
    const stmt = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC');
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

  async update(sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>): Promise<void> {
    if (updates.title !== undefined) {
      const db = this.conn.getDb();
      db.run(
        'UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?',
        [updates.title, Date.now(), sessionId]
      );
    }
  }

  async getStats(sessionId: string): Promise<SessionStats> {
    const db = this.conn.getDb();
    const stmt = db.prepare(`
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