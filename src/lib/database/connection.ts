import initSqlJs, { type Database } from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';

export class DatabaseConnection {
  private db: Database | null = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => {
          if (file.endsWith('.wasm')) {
            return `${import.meta.env.BASE_URL}${file}`;
          }
          return file;
        }
      });

      const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
      SQL.register_for_idb(sqlFS);

      SQL.FS.mkdir('/sql');
      SQL.FS.mount(sqlFS, {}, '/sql');

      const path = '/sql/imagen-studio.sqlite';
      this.db = new SQL.Database(path, { filename: true });

      this.db.exec(`
        PRAGMA journal_mode=MEMORY;
        PRAGMA page_size=8192;
      `);

      await this.ensureTablesExist();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async ensureTablesExist(): Promise<void> {
    const tableExists = this.db!.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='sessions';
    `);

    if (tableExists.length === 0) {
      await this.createTables();
    }
  }

  private async createTables(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        data BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        filename TEXT,
        size INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        content TEXT,
        role TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        image_id TEXT,
        audio_data BLOB,
        sent_to_ai INTEGER DEFAULT 0,
        FOREIGN KEY (image_id) REFERENCES images (id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        this.db!.exec(sql);
        break;
      } catch (error: any) {
        attempts++;
        if (error.message?.includes('locked') && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        throw error;
      }
    }
  }

  getDb(): Database {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }
}