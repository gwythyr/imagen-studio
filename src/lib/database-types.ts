import { type Message, type ChatSession, type SessionStats, type ImageRecord } from '../types/chat';

export interface DatabaseWorkerRequest {
  id: string;
  method: string;
  params: unknown[];
}

export interface DatabaseWorkerResponse {
  id: string;
  result?: unknown;
  error?: string;
}

export interface DatabaseMethods {
  initialize: () => Promise<void>;
  createSession: (title: string | null) => Promise<ChatSession>;
  addMessage: (sessionId: string, message: Omit<Message, 'id'>) => Promise<Message>;
  getMessages: (sessionId: string) => Promise<Message[]>;
  getSessions: () => Promise<ChatSession[]>;
  getSession: (sessionId: string) => Promise<ChatSession | null>;
  deleteMessage: (messageId: string) => Promise<void>;
  createImage: (imageData: { data: Uint8Array; mimeType: string; filename?: string; size: number }) => Promise<string>;
  getImage: (imageId: string) => Promise<ImageRecord | null>;
  getAllImages: () => Promise<ImageRecord[]>;
  deleteImage: (imageId: string) => Promise<void>;
  getSessionStats: (sessionId: string) => Promise<SessionStats>;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
  getGeminiApiKey: () => Promise<string | null>;
  setGeminiApiKey: (apiKey: string) => Promise<void>;
  markSessionMessagesAsSent: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>) => Promise<void>;
}
