import { ChatDatabase } from './database';
import { type ChatSession, type SessionStats } from '../types/chat';

export interface SessionWithStats extends ChatSession {
  stats: SessionStats;
}

export class SessionService {
  private db = new ChatDatabase();

  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  async getSessionsWithStats(): Promise<SessionWithStats[]> {
    const sessionsData = await this.db.getSessions();
    const sessionsWithStats: SessionWithStats[] = [];

    for (const session of sessionsData) {
      const stats = await this.db.getSessionStats(session.id);
      sessionsWithStats.push({ ...session, stats });
    }

    return sessionsWithStats;
  }

  async createSession(): Promise<ChatSession> {
    return this.db.createSession(null);
  }
}