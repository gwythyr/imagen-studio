// Legacy import removed - now using @sqlite.org/sqlite-wasm
import { type Message, type ChatSession, type SessionStats, type ImageRecord } from '../types/chat';
import { type DatabaseWorkerRequest, type DatabaseWorkerResponse, type DatabaseMethods } from './database-types';

export class ChatDatabase extends EventTarget implements DatabaseMethods {
  private worker: Worker | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  private initialized = false;

  constructor() {
    super();
    this.initializeWorker();
  }

  private initializeWorker(): void {
    console.log('Initialize Worker');
    try {
      this.worker = new Worker(new URL('./database.worker.ts', import.meta.url), { type: 'module' });

      // SQLite WASM worker - no additional backend needed

      this.worker.onmessage = (event: MessageEvent<DatabaseWorkerResponse>) => {
        const { id, result, error } = event.data;
        const pending = this.pendingRequests.get(id);

        if (pending) {
          this.pendingRequests.delete(id);
          if (error) {
            pending.reject(new Error(error));
          } else {
            pending.resolve(result);
          }
        }
      };

      this.worker.onerror = (error) => {
        console.error('Database worker error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize database worker:', error);
      throw error;
    }
  }

  private async callWorkerMethod<T>(method: string, ...params: any[]): Promise<T> {
    if (!this.worker) {
      throw new Error('Database worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const id = (++this.requestId).toString();
      this.pendingRequests.set(id, { resolve, reject });

      const request: DatabaseWorkerRequest = { id, method, params };
      this.worker!.postMessage(request);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Database operation timed out: ${method}`));
        }
      }, 30000);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.callWorkerMethod('initialize');
    this.initialized = true;
  }

  async createSession(title: string | null): Promise<ChatSession> {
    return this.callWorkerMethod('createSession', title);
  }

  async addMessage(sessionId: string, message: Omit<Message, 'id'>): Promise<Message> {
    return this.callWorkerMethod('addMessage', sessionId, message);
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.callWorkerMethod('getMessages', sessionId);
  }

  async getSessions(): Promise<ChatSession[]> {
    return this.callWorkerMethod('getSessions');
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.callWorkerMethod('getSession', sessionId);
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.callWorkerMethod('deleteMessage', messageId);
  }

  async createImage(imageData: { data: Uint8Array; mimeType: string; filename?: string; size: number }): Promise<string> {
    return this.callWorkerMethod('createImage', imageData);
  }

  async getImage(imageId: string): Promise<ImageRecord | null> {
    return this.callWorkerMethod('getImage', imageId);
  }

  async deleteImage(imageId: string): Promise<void> {
    return this.callWorkerMethod('deleteImage', imageId);
  }

  async getSessionStats(sessionId: string): Promise<SessionStats> {
    return this.callWorkerMethod('getSessionStats', sessionId);
  }

  async getSetting(key: string): Promise<string | null> {
    return this.callWorkerMethod('getSetting', key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    return this.callWorkerMethod('setSetting', key, value);
  }

  async getGeminiApiKey(): Promise<string | null> {
    return this.callWorkerMethod('getGeminiApiKey');
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    return this.callWorkerMethod('setGeminiApiKey', apiKey);
  }

  async markSessionMessagesAsSent(sessionId: string): Promise<void> {
    return this.callWorkerMethod('markSessionMessagesAsSent', sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<Pick<ChatSession, 'title'>>): Promise<void> {
    await this.callWorkerMethod('updateSession', sessionId, updates);
    this.dispatchEvent(new CustomEvent('sessionUpdated', { detail: { sessionId, updates } }));
  }

  async getDatabaseInfo(): Promise<{ filename: string; isOpfs: boolean; isInitialized: boolean }> {
    return this.callWorkerMethod('getDatabaseInfo');
  }

  async isUsingOpfs(): Promise<boolean> {
    return this.callWorkerMethod('isUsingOpfs');
  }

  // Cleanup method to terminate worker when done
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

// Singleton database instance
export const db = new ChatDatabase();
