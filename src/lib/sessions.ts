import { db } from './database';
import { type ChatSession, type SessionStats } from '../types/chat';

export interface SessionWithStats extends ChatSession {
  stats: SessionStats;
}

export class SessionService {
  async initialize(): Promise<void> {
    await db.initialize();
  }

  async getSessionsWithStats(): Promise<SessionWithStats[]> {
    const sessionsData = await db.getSessions();
    const sessionsWithStats: SessionWithStats[] = [];

    for (const session of sessionsData) {
      const stats = await db.getSessionStats(session.id);
      sessionsWithStats.push({ ...session, stats });
    }

    return sessionsWithStats;
  }

  async createSession(): Promise<ChatSession> {
    return db.createSession(null);
  }
}