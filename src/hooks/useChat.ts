import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { type ChatSession, type MessageType } from '../types/chat';
import { useMessages } from './useMessages';
import { GeminiMessageProcessor } from '../lib/geminiMessageProcessor';

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

  const handleMessage = async (messageData: { content?: string; audioData?: Uint8Array; imageData?: Uint8Array; mimeType?: string }) => {
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
        await addImageMessage(messageData.imageData, messageData.mimeType);
      }
    }
  };

  const handleAiClick = async () => {
    console.log(`AI button clicked. isApiInProgress: ${isApiInProgress}`);
    if (isApiInProgress) {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
        apiTimeoutRef.current = null;
      }
      setIsApiInProgress(false);
      return;
    }

    if (session.id === 'temp') {
      console.log(`Session is temporary. Cannot proceed.`);
      return;
    }

    setIsApiInProgress(true);

    try {
      const { ChatDatabase } = await import('../lib/database');
      const db = new ChatDatabase();
      await db.initialize();

      const apiKey = await db.getGeminiApiKey();
      if (!apiKey) {
        console.log('No API key found. Cannot proceed.');
        setIsApiInProgress(false);
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
      });

      const config = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["chatTitle", "imageGenerationPrompt"],
          properties: {
            chatTitle: {
              type: Type.STRING,
            },
            imageGenerationPrompt: {
              type: Type.STRING,
            },
            comment: {
              type: Type.STRING,
            },
          },
        },
      };

      const model = 'gemini-2.5-flash';

      const contents = GeminiMessageProcessor.processMessages(messages);

      const response = await ai.models.generateContent({
        model,
        config,
        contents,
      });

      if (!response.text) {
        setIsApiInProgress(false);
        return;
      }

      const responseData = JSON.parse(response.text);

      if (responseData.chatTitle) {
        await db.updateSession(session.id, { title: responseData.chatTitle });
      }

      if (responseData.comment) {
        await addMessage(responseData.comment, 'assistant');
      }

      if (responseData.imageGenerationPrompt) {
        await db.addMessage(session.id, {
          type: 'image_prompt' as const,
          content: responseData.imageGenerationPrompt,
          role: 'assistant' as const,
          timestamp: Date.now(),
        });
      }

      await db.markSessionMessagesAsSent(session.id);
      await refreshMessages();
    } finally {
      setIsApiInProgress(false);
    }
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
