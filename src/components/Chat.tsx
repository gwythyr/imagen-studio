import { useState, useRef, useEffect } from 'react';
import { type ChatSession } from '../types/chat';
import { useChat } from '../hooks/useChat';
import { useChatTitle } from '../hooks/useChatTitle';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ImageModal } from './ImageModal';
import { formatDate } from '../utils/formatDate';

interface ChatProps {
  session: ChatSession;
  onSessionCreated?: (sessionId: string) => void;
}

export function Chat({ session, onSessionCreated }: ChatProps) {
  const { messages, deleteMessage, handleMessage, handleAiClick, isApiInProgress, generateImageFromPrompt, isImageGenerating } = useChat({ session, onSessionCreated });
  const title = useChatTitle({ sessionId: session.id, initialTitle: session.title });
  const [imageModal, setImageModal] = useState<{ data: Uint8Array; messageId: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageClick = (imageData: Uint8Array, messageId: string) => {
    setImageModal({ data: imageData, messageId });
  };

  const handleSubmitText = (content: string) => {
    handleMessage({ content });
  };

  const handleSubmitAudio = (audioData: Uint8Array) => {
    handleMessage({ audioData });
  };

  const handleSubmitImage = (imageData: Uint8Array, mimeType: string) => {
    handleMessage({ imageData, mimeType });
  };

  useEffect(() => {
    if (imageModal) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [imageModal]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        padding: '60px 20px 20px 20px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: title ? 'var(--text-primary)' : 'var(--text-muted)'
        }}>
          {title ?? 'Untitled Chat'}
        </h1>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Created {formatDate(session.createdAt)}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onDeleteMessage={deleteMessage}
            onImageClick={handleImageClick}
            onGenerateImage={generateImageFromPrompt}
            isImageGenerating={isImageGenerating}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSubmitText={handleSubmitText}
        onSubmitAudio={handleSubmitAudio}
        onSubmitImage={handleSubmitImage}
        onAiClick={handleAiClick}
        isApiInProgress={isApiInProgress}
        isImageGenerating={isImageGenerating}
        disabled={session.id === 'temp'}
      />

      {imageModal && (
        <ImageModal
          imageData={imageModal.data}
          messageId={imageModal.messageId}
          onClose={() => setImageModal(null)}
        />
      )}
    </div>
  );
}