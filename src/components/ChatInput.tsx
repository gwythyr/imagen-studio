import { useState, useRef, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { ChatInputButton } from './ChatInputButton';

interface ChatInputProps {
  onSubmitText: (content: string) => void;
  onSubmitAudio: (audioData: Uint8Array) => void;
  onSubmitImage: (imageData: Uint8Array, mimeType: string) => void;
  onAiClick: () => void;
  isApiInProgress: boolean;
  isImageGenerating?: boolean;
  disabled: boolean;
}

const containerStyle: CSSProperties = {
  padding: '20px',
  borderTop: '1px solid #dee2e6',
  backgroundColor: '#ffffff'
};

const controlsRowStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end'
};

const textInputBaseStyle: CSSProperties = {
  flex: 1,
  padding: '12px 16px',
  border: '1px solid #dee2e6',
  borderRadius: '24px',
  fontSize: '14px',
  outline: 'none',
  resize: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease'
};

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
  const [isInputFocused, setIsInputFocused] = useState(false);
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

  const inputStyle = useMemo(() => ({
    ...textInputBaseStyle,
    borderColor: isInputFocused ? '#1976d2' : '#dee2e6',
    opacity: isAnyOperationInProgress ? 0.5 : 1,
    cursor: isAnyOperationInProgress ? 'not-allowed' : 'text'
  }), [isAnyOperationInProgress, isInputFocused]);

  return (
    <div style={containerStyle}>
      <div style={controlsRowStyle}>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnyOperationInProgress}
          style={inputStyle}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />

        <ChatInputButton
          icon="→"
          label="Send message"
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isAnyOperationInProgress}
          variant="send"
          fontSize="20px"
        />

        <ChatInputButton
          icon="●"
          label={isRecording ? 'Stop recording' : 'Start recording'}
          onClick={handleRecordClick}
          disabled={isAnyOperationInProgress}
          variant="record"
          active={isRecording}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
          disabled={isAnyOperationInProgress}
        />

        <ChatInputButton
          icon="+"
          label="Upload image"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnyOperationInProgress}
          variant="image"
        />

        <ChatInputButton
          icon={isAnyOperationInProgress ? '◆' : '✨'}
          label="Ask AI"
          onClick={onAiClick}
          disabled={disabled}
          variant="ai"
          busy={isAnyOperationInProgress}
        />
      </div>
    </div>
  );
}
