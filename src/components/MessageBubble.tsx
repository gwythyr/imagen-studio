import { type Message } from '../types/chat';
import { formatDate } from '../utils/formatDate';

interface MessageBubbleProps {
  message: Message;
  onDeleteMessage: (messageId: string) => void;
  onImageClick: (messageId: string) => void;
  onGenerateImage?: (prompt: string) => void;
  isImageGenerating?: boolean;
}

export function MessageBubble({ message, onDeleteMessage, onImageClick, onGenerateImage, isImageGenerating }: MessageBubbleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
        gap: '12px'
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '16px',
        backgroundColor: message.role === 'user' ? (message.sentToAi === false ? '#9e9e9e' : '#1976d2') : '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: message.role === 'user' ? '#ffffff' : '#666',
        flexShrink: 0
      }}>
        {message.role === 'user' ? 'U' : 'AI'}
      </div>

      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflow: 'visible'
      }}>
        <div style={{
          position: 'relative',
          backgroundColor: message.role === 'user' ? (message.sentToAi === false ? '#9e9e9e' : '#1976d2') : '#f5f5f5',
          color: message.role === 'user' ? '#ffffff' : '#333',
          padding: '12px 16px',
          borderRadius: '18px',
          borderTopLeftRadius: message.role === 'user' ? '18px' : '4px',
          borderTopRightRadius: message.role === 'user' ? '4px' : '18px',
          wordWrap: 'break-word',
          fontSize: '14px',
          lineHeight: '1.4',
          overflow: 'visible'
        }}
        onMouseEnter={e => {
          const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
          if (deleteBtn) deleteBtn.style.opacity = '1';
        }}
        onMouseLeave={e => {
          const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
          if (deleteBtn) deleteBtn.style.opacity = '0';
        }}
        >
          {(message.imageData || message.imageContent) && (
            <img
              src={URL.createObjectURL(new Blob(
                [message.imageContent?.data || message.imageData!],
                { type: message.imageContent?.mimeType || 'image/jpeg' }
              ))}
              alt="Uploaded image"
              onClick={() => onImageClick(message.id)}
              style={{
                maxWidth: '400px',
                maxHeight: '400px',
                borderRadius: '8px',
                marginBottom: message.content ? '8px' : '0',
                cursor: 'pointer'
              }}
            />
          )}
          {message.audioData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: message.content ? '8px' : '0'
            }}>
              <audio
                controls
                src={URL.createObjectURL(new Blob([message.audioData], { type: 'audio/wav' }))}
                style={{ flex: 1 }}
              />
            </div>
          )}
          <span style={{ fontStyle: message.type === 'image_prompt' ? 'italic' : 'normal' }}>
            {message.content}
          </span>
          <button
            className="delete-btn"
            onClick={() => onDeleteMessage(message.id)}
            style={{
              position: 'absolute',
              top: '4px',
              right: message.role === 'user' ? '4px' : 'auto',
              left: message.role === 'user' ? 'auto' : '4px',
              width: '30px',
              height: '30px',
              border: 'none',
              borderRadius: '15px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              color: message.role === 'user' ? '#ffffff' : '#666',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: '0',
              transition: 'opacity 0.2s ease',
              padding: '0'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            }}
          >
            ×
          </button>
          {message.type === 'image_prompt' && onGenerateImage && message.content && (
            <button
              className="generate-btn"
              onClick={() => onGenerateImage(message.content!)}
              disabled={isImageGenerating}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '40px',
                height: '40px',
                border: 'none',
                outline: 'none',
                borderRadius: '20px',
                backgroundColor: isImageGenerating ? 'rgba(255, 165, 0, 0.9)' : 'rgba(99, 102, 241, 0.9)',
                color: '#ffffff',
                cursor: isImageGenerating ? 'not-allowed' : 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: '1',
                transition: 'all 0.2s ease',
                padding: '0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={e => {
                if (!isImageGenerating) {
                  e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = isImageGenerating ? 'rgba(255, 165, 0, 0.9)' : 'rgba(99, 102, 241, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isImageGenerating ? '⏳' : '✨'}
            </button>
          )}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#999',
          textAlign: message.role === 'user' ? 'right' : 'left'
        }}>
          {formatDate(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
