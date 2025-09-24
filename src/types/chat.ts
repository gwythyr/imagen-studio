export interface Message {
  id: string;
  content?: string;
  role: 'user' | 'assistant';
  timestamp: number;
  imageData?: Uint8Array;
  audioData?: Uint8Array;
}

export interface ChatSession {
  id: string;
  title: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface SessionStats {
  sessionId: string;
  messageCount: number;
  lastMessageTimestamp: number | null;
}
