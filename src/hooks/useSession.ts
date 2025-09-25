import { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { type ChatSession } from '../types/chat';

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      await db.initialize();
      const sessions = await db.getSessions();
      const foundSession = sessions.find(s => s.id === sessionId);
      setSession(foundSession || null);
      setLoading(false);
    };

    loadSession();
  }, [sessionId]);

  return { session, loading };
}