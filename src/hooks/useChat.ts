import { type ChatSession, type MessageType } from '../types/chat';
import { useMessages } from './useMessages';
import { useAiInteraction } from './useAiInteraction';

interface UseChatProps {
  session: ChatSession;
  onSessionCreated?: (sessionId: string) => void;
}

export function useChat({ session, onSessionCreated }: UseChatProps) {
  const { messages, addMessage, addAudioMessage, addImageMessage, deleteMessage, refreshMessages } = useMessages(session.id === 'temp' ? null : session.id);
  const { handleAiClick, isApiInProgress, generateImageFromPrompt, isImageGenerating, workflowStage } = useAiInteraction({
    session,
    messages,
    addMessage,
    refreshMessages
  });

  const createNewSession = async () => {
    const { SessionService } = await import('../lib/sessions');
    const sessionService = new SessionService();
    await sessionService.initialize();
    const newSession = await sessionService.createSession();

    const { db } = await import('../lib/database');
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


  return {
    messages,
    deleteMessage,
    handleMessage,
    handleAiClick,
    isApiInProgress,
    generateImageFromPrompt,
    isImageGenerating,
    workflowStage
  };
}
