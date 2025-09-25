import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

export class DatabaseConnection {
  private db: any = null;
  private sqlite3: any = null;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('Loading and initializing SQLite3 module...');

      this.sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });

      console.log('Running SQLite3 version', this.sqlite3.version.libVersion);

      // Use OPFS if available, otherwise fallback to memory
      this.db = 'opfs' in this.sqlite3
        ? new this.sqlite3.oo1.OpfsDb('/imagen-studio.sqlite3')
        : new this.sqlite3.oo1.DB('/imagen-studio.sqlite3', 'ct');

      console.log(
        'opfs' in this.sqlite3
          ? `OPFS is available, created persisted database at ${this.db.filename}`
          : `OPFS is not available, created transient database ${this.db.filename}`,
      );

      // Set pragmas for performance
      this.db.exec(`
        PRAGMA journal_mode=WAL;
        PRAGMA synchronous=NORMAL;
        PRAGMA cache_size=10000;
        PRAGMA foreign_keys=ON;
        PRAGMA temp_store=memory;
      `);

      await this.ensureTablesExist();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async ensureTablesExist(): Promise<void> {
    const result = this.db.exec({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions';",
      returnValue: 'resultRows'
    });

    if (result.length === 0) {
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

    this.db.exec(sql);
  }

  getDb(): any {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }
}