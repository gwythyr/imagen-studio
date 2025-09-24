import { useState, useEffect, useCallback } from 'react';
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

  const addMessage = useCallback(async (content: string, role: 'user' | 'assistant') => {
    if (!sessionId) return;

    const db = new ChatDatabase();
    await db.initialize();

    const newMessage = await db.addMessage(sessionId, {
      content,
      role,
      timestamp: Date.now()
    });

    setMessages(prev => [...prev, newMessage]);
  }, [sessionId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!sessionId) return;

    const db = new ChatDatabase();
    await db.initialize();
    await db.deleteMessage(messageId);

    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, [sessionId]);

  return { messages, loading, addMessage, deleteMessage };
}