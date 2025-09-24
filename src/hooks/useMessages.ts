import { useState, useEffect } from 'react';
import { ChatDatabase } from '../lib/database';
import { type Message } from '../types/chat';

export function useMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      const db = new ChatDatabase();
      await db.initialize();
      const sessionMessages = await db.getMessages(sessionId);
      setMessages(sessionMessages);
      setLoading(false);
    };

    loadMessages();
  }, [sessionId]);

  return { messages, loading };
}