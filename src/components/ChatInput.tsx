import { useState, useRef, useEffect } from 'react';
import { useAudioRecording } from '../hooks/useAudioRecording';

interface ChatInputProps {
  onSubmitText: (content: string) => void;
  onSubmitAudio: (audioData: Uint8Array) => void;
  onSubmitImage: (imageData: Uint8Array, mimeType: string) => void;
  onAiClick: () => void;
  isApiInProgress: boolean;
  isImageGenerating?: boolean;
  disabled: boolean;
}

export function ChatInput({
  onSubmitText,
  onSubmitAudio,
  onSubmitImage,
  onAiClick,
  isApiInProgress,
  isImageGenerating,
  disabled
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, audioData, startRecording, stopRecording, clearRecording } = useAudioRecording();

  const isAnyOperationInProgress = isApiInProgress || isImageGenerating;

  const handleSubmit = async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');
    onSubmitText(content);
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

    onSubmitImage(imageData, file.type);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (audioData && !isRecording) {
      onSubmitAudio(audioData);
      clearRecording();
    }
  }, [audioData, isRecording, onSubmitAudio, clearRecording]);

  return (
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
          disabled={isAnyOperationInProgress}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #dee2e6',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            opacity: isAnyOperationInProgress ? '0.5' : '1',
            cursor: isAnyOperationInProgress ? 'not-allowed' : 'text'
          }}
          onFocus={e => {
            if (!isAnyOperationInProgress) {
              e.target.style.borderColor = '#1976d2';
            }
          }}
          onBlur={e => {
            e.target.style.borderColor = '#dee2e6';
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isAnyOperationInProgress}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: (!inputValue.trim() || isAnyOperationInProgress) ? 'rgba(0,0,0,0.1)' : '#2563eb',
            color: (!inputValue.trim() || isAnyOperationInProgress) ? 'rgba(0,0,0,0.4)' : '#ffffff',
            cursor: (!inputValue.trim() || isAnyOperationInProgress) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: (!inputValue.trim() || isAnyOperationInProgress) ? 'none' : '0 2px 8px rgba(37,99,235,0.3)',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => {
            if (inputValue.trim() && !isAnyOperationInProgress) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.4)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = (!inputValue.trim() || isAnyOperationInProgress) ? 'rgba(0,0,0,0.1)' : '#2563eb';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = (!inputValue.trim() || isAnyOperationInProgress) ? 'none' : '0 2px 8px rgba(37,99,235,0.3)';
          }}
          onMouseDown={e => {
            if (inputValue.trim() && !isAnyOperationInProgress) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={e => {
            if (inputValue.trim() && !isAnyOperationInProgress) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
        >
          →
        </button>

        <button
          onClick={handleRecordClick}
          disabled={isAnyOperationInProgress}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isAnyOperationInProgress ? 'rgba(0,0,0,0.1)' : isRecording ? '#ef4444' : '#64748b',
            color: isAnyOperationInProgress ? 'rgba(0,0,0,0.4)' : '#ffffff',
            cursor: isAnyOperationInProgress ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: isAnyOperationInProgress ? 'none' : isRecording ? '0 2px 8px rgba(239,68,68,0.3)' : '0 2px 8px rgba(100,116,139,0.3)',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!isAnyOperationInProgress) {
              e.currentTarget.style.backgroundColor = isRecording ? '#dc2626' : '#475569';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = isRecording ? '0 4px 12px rgba(239,68,68,0.4)' : '0 4px 12px rgba(100,116,139,0.4)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = isAnyOperationInProgress ? 'rgba(0,0,0,0.1)' : isRecording ? '#ef4444' : '#64748b';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = isAnyOperationInProgress ? 'none' : isRecording ? '0 2px 8px rgba(239,68,68,0.3)' : '0 2px 8px rgba(100,116,139,0.3)';
          }}
          onMouseDown={e => {
            if (!isAnyOperationInProgress) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={e => {
            if (!isAnyOperationInProgress) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
        >
          ●
        </button>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
          disabled={isAnyOperationInProgress}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnyOperationInProgress}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isAnyOperationInProgress ? 'rgba(0,0,0,0.1)' : '#10b981',
            color: isAnyOperationInProgress ? 'rgba(0,0,0,0.4)' : '#ffffff',
            cursor: isAnyOperationInProgress ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: isAnyOperationInProgress ? 'none' : '0 2px 8px rgba(16,185,129,0.3)',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!isAnyOperationInProgress) {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.4)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = isAnyOperationInProgress ? 'rgba(0,0,0,0.1)' : '#10b981';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = isAnyOperationInProgress ? 'none' : '0 2px 8px rgba(16,185,129,0.3)';
          }}
          onMouseDown={e => {
            if (!isAnyOperationInProgress) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={e => {
            if (!isAnyOperationInProgress) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
        >
          +
        </button>

        <button
          onClick={onAiClick}
          disabled={disabled}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: disabled ? 'rgba(0,0,0,0.1)' : isAnyOperationInProgress ? '#f59e0b' : '#6366f1',
            color: disabled ? 'rgba(0,0,0,0.4)' : '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '500',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: disabled ? 'none' : isAnyOperationInProgress ? '0 2px 8px rgba(245,158,11,0.3)' : '0 2px 8px rgba(99,102,241,0.3)',
            transform: 'scale(1)',
          }}
          onMouseEnter={e => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = isAnyOperationInProgress ? '#d97706' : '#4f46e5';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = isAnyOperationInProgress ? '0 4px 12px rgba(245,158,11,0.4)' : '0 4px 12px rgba(99,102,241,0.4)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = disabled ? 'rgba(0,0,0,0.1)' : isAnyOperationInProgress ? '#f59e0b' : '#6366f1';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = disabled ? 'none' : isAnyOperationInProgress ? '0 2px 8px rgba(245,158,11,0.3)' : '0 2px 8px rgba(99,102,241,0.3)';
          }}
          onMouseDown={e => {
            if (!disabled) {
              e.currentTarget.style.transform = 'scale(0.95)';
            }
          }}
          onMouseUp={e => {
            if (!disabled) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
        >
          {isAnyOperationInProgress ? '◆' : '✨'}
        </button>
      </div>
    </div>
  );
}