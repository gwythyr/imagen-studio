import { useState, useRef, useEffect } from 'react';
import { type ChatSession } from '../types/chat';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ImageModal } from './ImageModal';
import { formatDate } from '../utils/formatDate';

interface ChatProps {
  session: ChatSession;
  onSessionCreated?: (sessionId: string) => void;
}

export function Chat({ session, onSessionCreated }: ChatProps) {
  const { messages, deleteMessage, handleMessage, handleAiClick, isApiInProgress } = useChat({ session, onSessionCreated });
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImageModal(null);
      }
    };

    if (imageModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
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
          color: session.title ? 'var(--text-primary)' : 'var(--text-muted)'
        }}>
          {session.title ?? 'Untitled Chat'}
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