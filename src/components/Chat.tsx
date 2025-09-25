import { useState, useRef, useEffect } from 'react';
import { type ChatSession } from '../types/chat';
import { useMessages } from '../hooks/useMessages';
import { useAudioRecording } from '../hooks/useAudioRecording';

interface ChatProps {
  session: ChatSession;
  onSessionCreated?: (sessionId: string) => void;
}

export function Chat({ session, onSessionCreated }: ChatProps) {
  const { messages, addMessage, addAudioMessage, addImageMessage, deleteMessage } = useMessages(session.id === 'temp' ? null : session.id);
  const [inputValue, setInputValue] = useState('');
  const [imageModal, setImageModal] = useState<{ data: Uint8Array; messageId: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, audioData, startRecording, stopRecording, clearRecording } = useAudioRecording();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      await db.addMessage(newSession.id, {
        role: 'user',
        timestamp: Date.now(),
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

  useEffect(() => {
    if (audioData && !isRecording) {
      handleMessage({ audioData }).then(() => clearRecording());
    }
  }, [audioData, isRecording, handleMessage, clearRecording]);

  const handleSubmit = async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');
    await handleMessage({ content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearRecording();
      await startRecording();
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const arrayBuffer = await file.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    await handleMessage({ imageData });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (imageData: Uint8Array, messageId: string) => {
    setImageModal({ data: imageData, messageId });
  };

  const handleDownloadImage = () => {
    if (!imageModal) return;

    const blob = new Blob([imageModal.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-${imageModal.messageId}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        padding: '60px 20px 20px 20px',
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600',
          color: session.title ? '#333' : '#999'
        }}>
          {session.title ?? 'Untitled Chat'}
        </h1>
        <div style={{
          fontSize: '14px',
          color: '#666'
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
          <div
            key={message.id}
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
              gap: '4px'
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
                lineHeight: '1.4'
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
                {message.imageData && (
                  <img
                    src={URL.createObjectURL(new Blob([message.imageData]))}
                    alt="Uploaded image"
                    onClick={() => handleImageClick(message.imageData!, message.id)}
                    style={{
                      maxWidth: '400px',
                      maxHeight: '400px',
                      borderRadius: '8px',
                      marginBottom: message.content ? '8px' : '0',
                      cursor: 'pointer'
                    }}
                  />
                )}
                {message.content || (message.imageData ? '' : '[Audio message]')}
                <button
                  className="delete-btn"
                  onClick={() => deleteMessage(message.id)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: message.role === 'user' ? '4px' : 'auto',
                    left: message.role === 'user' ? 'auto' : '4px',
                    width: '20px',
                    height: '20px',
                    border: 'none',
                    borderRadius: '10px',
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '20px',
        borderTop: '1px solid #dee2e6',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #dee2e6',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#1976d2';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#dee2e6';
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: inputValue.trim() ? '#1976d2' : '#ccc',
              color: '#ffffff',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => {
              if (inputValue.trim()) {
                e.currentTarget.style.backgroundColor = '#1565c0';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = inputValue.trim() ? '#1976d2' : '#ccc';
            }}
          >
            ➤
          </button>

          <button
            onClick={handleRecordClick}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: isRecording ? '#dc3545' : '#6c757d',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = isRecording ? '#c82333' : '#5a6268';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = isRecording ? '#dc3545' : '#6c757d';
            }}
          >
            🎤
          </button>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: 'none',
              backgroundColor: '#28a745',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#218838';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
          >
            🖼️
          </button>
        </div>
      </div>

      {imageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
          onClick={() => setImageModal(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 'calc(100vw - 80px)',
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={URL.createObjectURL(new Blob([imageModal.data]))}
              alt="Full size image"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />

            <button
              onClick={() => setImageModal(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '600'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              ×
            </button>

            <button
              onClick={handleDownloadImage}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                width: '50px',
                height: '50px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              }}
            >
              ⬇️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
