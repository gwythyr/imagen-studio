import { useState, useRef, useEffect } from 'react';
import { type ChatSession, type Message, type AiWorkflowStage } from '../types/chat';
import { LlmService } from '../services/llmService';

interface UseAiInteractionProps {
  session: ChatSession;
  messages: Message[];
  addMessage: (content: string, role: 'user' | 'assistant') => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export function useAiInteraction({ session, messages, addMessage, refreshMessages }: UseAiInteractionProps) {
  const [isApiInProgress, setIsApiInProgress] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<AiWorkflowStage>('idle');
  const apiTimeoutRef = useRef<number | null>(null);
  const isApiInProgressRef = useRef(false);
  const isImageGeneratingRef = useRef(false);

  const generateImageFromPrompt = async (prompt: string) => {
    if (session.id === 'temp') return;

    setWorkflowStage('image');
    setIsImageGenerating(true);
    isImageGeneratingRef.current = true;
    try {
      const { db } = await import('../lib/database');
      await db.initialize();

      const apiKey = await db.getGeminiApiKey();
      if (!apiKey) return;

      const imageData = await LlmService.generateImage(apiKey, prompt);

      if (imageData) {
        await db.addMessage(session.id, {
          type: 'image' as const,
          role: 'assistant' as const,
          timestamp: Date.now(),
          imageData,
        });

        await refreshMessages();
      }
    } finally {
      setIsImageGenerating(false);
      isImageGeneratingRef.current = false;
      if (!isApiInProgressRef.current) {
        setWorkflowStage('idle');
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
    isApiInProgressRef.current = true;
    setWorkflowStage('prompt');

    try {
      const { db } = await import('../lib/database');
      await db.initialize();

      const apiKey = await db.getGeminiApiKey();
      if (!apiKey) {
        console.log('No API key found. Cannot proceed.');
        setIsApiInProgress(false);
        isApiInProgressRef.current = false;
        if (!isImageGeneratingRef.current) {
          setWorkflowStage('idle');
        }
        return;
      }

      const responseData = await LlmService.generateResponse(apiKey, messages);

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

      if (responseData.imageGenerationPrompt) {
        await generateImageFromPrompt(responseData.imageGenerationPrompt);
      }
    } finally {
      setIsApiInProgress(false);
      isApiInProgressRef.current = false;
      if (!isImageGeneratingRef.current) {
        setWorkflowStage('idle');
      }
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
    isApiInProgress,
    generateImageFromPrompt,
    isImageGenerating,
    workflowStage
  };
}
