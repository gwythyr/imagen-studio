import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { type ChatSession, type Message } from '../types/chat';
import { GeminiMessageProcessor } from '../lib/geminiMessageProcessor';

interface UseAiInteractionProps {
  session: ChatSession;
  messages: Message[];
  addMessage: (content: string, role: 'user' | 'assistant') => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export function useAiInteraction({ session, messages, addMessage, refreshMessages }: UseAiInteractionProps) {
  const [isApiInProgress, setIsApiInProgress] = useState(false);
  const apiTimeoutRef = useRef<number | null>(null);

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
    handleAiClick,
    isApiInProgress
  };
}