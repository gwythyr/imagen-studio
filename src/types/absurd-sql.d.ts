// Type declarations for absurd-sql and @jlongster/sql.js

declare module 'absurd-sql' {
  export class SQLiteFS {
    constructor(FS: any, backend: any): SQLiteFS;
  }
}

declare module 'absurd-sql/dist/indexeddb-backend' {
  export default class IndexedDBBackend {
    constructor(): IndexedDBBackend;
  }
}

declare module 'absurd-sql/dist/indexeddb-main-thread' {
  export function initBackend(worker: Worker): void;
}

// @jlongster/sql.js extends sql.js, so we can reuse most of the sql.js types
declare module '@jlongster/sql.js' {
  import { Database as SqlDatabase, SqlJsStatic } from 'sql.js';

  interface ExtendedDatabase extends SqlDatabase {}

  interface ExtendedSqlJsStatic extends SqlJsStatic {
    Database: new (dataOrPath?: ArrayLike<number> | Buffer | string | null, params?: { filename?: boolean }) => ExtendedDatabase;
    FS: any;
    register_for_idb(sqlFS: any): void;
  }

  export { ExtendedDatabase as Database };
  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<ExtendedSqlJsStatic>;
}