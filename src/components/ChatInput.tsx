import { useState, useRef, useEffect } from 'react';
import { useAudioRecording } from '../hooks/useAudioRecording';

interface ChatInputProps {
  onSubmitText: (content: string) => void;
  onSubmitAudio: (audioData: Uint8Array) => void;
  onSubmitImage: (imageData: Uint8Array, mimeType: string) => void;
  onAiClick: () => void;
  isApiInProgress: boolean;
  disabled: boolean;
}

export function ChatInput({
  onSubmitText,
  onSubmitAudio,
  onSubmitImage,
  onAiClick,
  isApiInProgress,
  disabled
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, audioData, startRecording, stopRecording, clearRecording } = useAudioRecording();

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
          disabled={isApiInProgress}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #dee2e6',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            opacity: isApiInProgress ? '0.5' : '1',
            cursor: isApiInProgress ? 'not-allowed' : 'text'
          }}
          onFocus={e => {
            if (!isApiInProgress) {
              e.target.style.borderColor = '#1976d2';
            }
          }}
          onBlur={e => {
            e.target.style.borderColor = '#dee2e6';
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isApiInProgress}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: (!inputValue.trim() || isApiInProgress) ? '#ccc' : '#1976d2',
            color: '#ffffff',
            cursor: (!inputValue.trim() || isApiInProgress) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease',
            opacity: isApiInProgress ? '0.5' : '1'
          }}
          onMouseEnter={e => {
            if (inputValue.trim() && !isApiInProgress) {
              e.currentTarget.style.backgroundColor = '#1565c0';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = (!inputValue.trim() || isApiInProgress) ? '#ccc' : '#1976d2';
          }}
        >
          ➤
        </button>

        <button
          onClick={handleRecordClick}
          disabled={isApiInProgress}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: isRecording ? '#dc3545' : '#6c757d',
            color: '#ffffff',
            cursor: isApiInProgress ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease',
            opacity: isApiInProgress ? '0.5' : '1'
          }}
          onMouseEnter={e => {
            if (!isApiInProgress) {
              e.currentTarget.style.backgroundColor = isRecording ? '#c82333' : '#5a6268';
            }
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
          disabled={isApiInProgress}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isApiInProgress}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: '#28a745',
            color: '#ffffff',
            cursor: isApiInProgress ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease',
            opacity: isApiInProgress ? '0.5' : '1'
          }}
          onMouseEnter={e => {
            if (!isApiInProgress) {
              e.currentTarget.style.backgroundColor = '#218838';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#28a745';
          }}
        >
          🖼️
        </button>

        <button
          onClick={onAiClick}
          disabled={disabled}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: isApiInProgress ? '#dc3545' : '#007bff',
            color: '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease',
            opacity: disabled ? '0.5' : '1'
          }}
          onMouseEnter={e => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = isApiInProgress ? '#c82333' : '#0056b3';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = isApiInProgress ? '#dc3545' : '#007bff';
          }}
        >
          {isApiInProgress ? '⏸️' : '🤖'}
        </button>
      </div>
    </div>
  );
}