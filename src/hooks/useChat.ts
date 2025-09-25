import { useState, useRef, useEffect } from 'react';
import { type ChatSession, type MessageType } from '../types/chat';
import { useMessages } from './useMessages';

interface UseChatProps {
  session: ChatSession;
  onSessionCreated?: (sessionId: string) => void;
}

export function useChat({ session, onSessionCreated }: UseChatProps) {
  const { messages, addMessage, addAudioMessage, addImageMessage, deleteMessage, refreshMessages } = useMessages(session.id === 'temp' ? null : session.id);
  const [isApiInProgress, setIsApiInProgress] = useState(false);
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createNewSession = async () => {
    const { SessionService } = await import('../lib/sessions');
    const sessionService = new SessionService();
    await sessionService.initialize();
    const newSession = await sessionService.createSession();

    const { ChatDatabase } = await import('../lib/database');
    const db = new ChatDatabase();
    await db.initialize();

    return { newSession, db };
  };

  const handleMessage = async (messageData: { content?: string; audioData?: Uint8Array; imageData?: Uint8Array }) => {
    if (session.id === 'temp') {
      const { newSession, db } = await createNewSession();
      const type: MessageType = messageData.imageData ? 'image' : messageData.audioData ? 'audio' : 'text';
      await db.addMessage(newSession.id, {
        type: type,
        role: 'user',
        timestamp: Date.now(),
        sentToAi: false,
        ...messageData
      });

      if (onSessionCreated) {
        onSessionCreated(newSession.id);
      }
    } else {
      if (messageData.content) {
        await addMessage(messageData.content, 'user');
      } else if (messageData.audioData) {
        await addAudioMessage(messageData.audioData);
      } else if (messageData.imageData) {
        await addImageMessage(messageData.imageData);
      }
    }
  };

  const handleAiClick = async () => {
    if (isApiInProgress) {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
        apiTimeoutRef.current = null;
      }
      setIsApiInProgress(false);
      return;
    }

    if (session.id === 'temp') return;

    setIsApiInProgress(true);

    const { ChatDatabase } = await import('../lib/database');
    const db = new ChatDatabase();
    await db.initialize();
    await db.markSessionMessagesAsSent(session.id);
    await refreshMessages();

    apiTimeoutRef.current = setTimeout(() => {
      setIsApiInProgress(false);
      apiTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    deleteMessage,
    handleMessage,
    handleAiClick,
    isApiInProgress
  };
}