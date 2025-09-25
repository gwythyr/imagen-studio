import { DatabaseConnection } from './connection';

export class SettingsService {
  private conn: DatabaseConnection;

  constructor(conn: DatabaseConnection) {
    this.conn = conn;
  }

  async get(key: string): Promise<string | null> {
    const db = this.conn.getDb();
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    stmt.bind([key]);

    let value: string | null = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      value = row.value as string;
    }

    stmt.free();
    return value;
  }

  async set(key: string, value: string): Promise<void> {
    const db = this.conn.getDb();
    db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  async getGeminiApiKey(): Promise<string | null> {
    return this.get('gemini_api_key');
  }

  async setGeminiApiKey(apiKey: string): Promise<void> {
    await this.set('gemini_api_key', apiKey);
  }
}