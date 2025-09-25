import { DatabaseConnection } from './connection';

export class SettingsService {
  private conn: DatabaseConnection;

  constructor(conn: DatabaseConnection) {
    this.conn = conn;
  }

  async get(key: string): Promise<string | null> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: 'SELECT value FROM settings WHERE key = ?',
      bind: [key],
      returnValue: 'resultRows'
    });

    const value: string | null = result.length > 0 ? result[0][0] as string : null;
    return value;
  }

  async set(key: string, value: string): Promise<void> {
    const db = this.conn.getDb();
    db.exec({
      sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      bind: [key, value]
    });
  }

  async getGeminiApiKey(): Promise<string | null> {
    return this.get('gemini_api_key');
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    await this.set('gemini_api_key', apiKey);
  }
}