import type { CSSProperties } from 'react';
import { type AiWorkflowStage } from '../types/chat';

interface AiWorkflowStatusProps {
  stage: AiWorkflowStage;
  isPromptActive: boolean;
  isImageActive: boolean;
}

const containerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0 20px 12px 20px',
  color: 'var(--text-secondary)',
  fontSize: '13px'
};

const dotStyle: CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '5px',
  backgroundColor: '#f59e0b',
  boxShadow: '0 0 6px rgba(245, 158, 11, 0.7)',
  animation: 'aiStatusPulse 1.2s ease-in-out infinite',
  flexShrink: 0
};

export function AiWorkflowStatus({ stage, isPromptActive, isImageActive }: AiWorkflowStatusProps) {
  if (stage === 'prompt' && !isPromptActive) {
    return null;
  }

  if (stage === 'image' && !isImageActive) {
    return null;
  }

  if (stage === 'idle') {
    return null;
  }

  const label = stage === 'prompt' ? 'Generating prompt...' : 'Generating image...';

  return (
    <div style={containerStyle}>
      <span style={dotStyle} />
      <span>{label}</span>
    </div>
  );
}
