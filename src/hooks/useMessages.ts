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
      type: 'text' as const,
      content,
      role,
      timestamp: Date.now(),
      sentToAi: role === 'user' ? false : undefined
    });

    setMessages(prev => [...prev, newMessage]);
  }, [sessionId]);

  const addAudioMessage = useCallback(async (audioData: Uint8Array, role: 'user' | 'assistant' = 'user') => {
    if (!sessionId) return;

    const db = new ChatDatabase();
    await db.initialize();

    const newMessage = await db.addMessage(sessionId, {
      type: 'audio' as const,
      role,
      timestamp: Date.now(),
      audioData,
      sentToAi: role === 'user' ? false : undefined
    });

    setMessages(prev => [...prev, newMessage]);
  }, [sessionId]);

  const addImageMessage = useCallback(async (imageData: Uint8Array, mimeType?: string, role: 'user' | 'assistant' = 'user') => {
    if (!sessionId) return;

    const db = new ChatDatabase();
    await db.initialize();

    const newMessage = await db.addMessage(sessionId, {
      type: 'image' as const,
      role,
      timestamp: Date.now(),
      imageContent: mimeType ? { data: imageData, mimeType } : undefined,
      imageData: !mimeType ? imageData : undefined,
      sentToAi: role === 'user' ? false : undefined
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

  const refreshMessages = useCallback(async () => {
    if (!sessionId) return;

    const db = new ChatDatabase();
    await db.initialize();
    const sessionMessages = await db.getMessages(sessionId);
    setMessages(sessionMessages);
  }, [sessionId]);

  return { messages, loading, addMessage, addAudioMessage, addImageMessage, deleteMessage, refreshMessages };
}
