import { type Message, type ChatSession, type SessionStats, type ImageRecord } from '../types/chat';
import { type DatabaseWorkerRequest, type DatabaseWorkerResponse } from './database-types';
import { DatabaseConnection } from './database/connection';
import { SessionService } from './database/session-service';
import { ImageService } from './database/image-service';
import { MessageService } from './database/message-service';
import { SettingsService } from './database/settings-service';

class DatabaseWorker {
  private conn: DatabaseConnection;
  private sessions: SessionService;
  private images: ImageService;
  private messages: MessageService;
  private settings: SettingsService;

  constructor() {
    this.conn = new DatabaseConnection();
    this.images = new ImageService(this.conn);
    this.sessions = new SessionService(this.conn);
    this.messages = new MessageService(this.conn, this.images);
    this.settings = new SettingsService(this.conn);
  }

  async initialize(): Promise<void> {
    await this.conn.initialize();
  }

  // Legacy method mapping for backward compatibility
  async createSession(title: string | null): Promise<ChatSession> {
    return this.sessions.create(title);
  }

  async getSessions(): Promise<ChatSession[]> {
    return this.sessions.getAll();
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>): Promise<void> {
    return this.sessions.update(sessionId, updates);
  }

  async getSessionStats(sessionId: string): Promise<SessionStats> {
    return this.sessions.getStats(sessionId);
  }

  async createImage(imageData: { data: Uint8Array; mimeType: string; filename?: string; size: number }): Promise<string> {
    return this.images.create(imageData);
  }

  async getImage(imageId: string): Promise<ImageRecord | null> {
    return this.images.get(imageId);
  }

  async deleteImage(imageId: string): Promise<void> {
    return this.images.delete(imageId);
  }

  async addMessage(sessionId: string, message: Omit<Message, 'id'>): Promise<Message> {
    return this.messages.add(sessionId, message);
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.getAll(sessionId);
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.messages.delete(messageId);
  }

  async markSessionMessagesAsSent(sessionId: string): Promise<void> {
    return this.messages.markSessionAsSent(sessionId);
  }

  async getSetting(key: string): Promise<string | null> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    return this.settings.set(key, value);
  }

  async getGeminiApiKey(): Promise<string | null> {
    return this.settings.getGeminiApiKey();
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    return this.settings.setGeminiApiKey(apiKey);
  }

  async getDatabaseInfo(): Promise<{ filename: string; isOpfs: boolean; isInitialized: boolean }> {
    return this.conn.getDatabaseInfo();
  }

  async isUsingOpfs(): Promise<boolean> {
    return this.conn.isUsingOpfs();
  }
}

const dbWorker = new DatabaseWorker();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<DatabaseWorkerRequest>) => {
  const { id, method, params } = event.data;

  try {
    // Ensure database is initialized
    await dbWorker.initialize();

    // Call the appropriate method
    const result = await (dbWorker as any)[method](...params);

    // Send success response
    const response: DatabaseWorkerResponse = { id, result };
    self.postMessage(response);
  } catch (error) {
    // Send error response
    const response: DatabaseWorkerResponse = {
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(response);
  }
};
