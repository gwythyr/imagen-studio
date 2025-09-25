import { useState, useEffect } from 'react';
import { db } from '../lib/database';

interface UseChatTitleProps {
  sessionId: string;
  initialTitle: string | null;
}

export function useChatTitle({ sessionId, initialTitle }: UseChatTitleProps) {
  const [title, setTitle] = useState<string | null>(initialTitle);

  useEffect(() => {
    const handleSessionUpdated = (event: CustomEvent) => {
      const { sessionId: updatedSessionId, updates } = event.detail;
      if (updatedSessionId === sessionId && updates.title !== undefined) {
        setTitle(updates.title);
      }
    };

    db.addEventListener('sessionUpdated', handleSessionUpdated as EventListener);

    return () => {
      db.removeEventListener('sessionUpdated', handleSessionUpdated as EventListener);
    };
  }, [sessionId]);

  return title;
}