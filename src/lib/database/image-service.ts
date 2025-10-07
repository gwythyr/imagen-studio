import { type ImageRecord } from '../../types/chat';
import { DatabaseConnection } from './connection';

export class ImageService {
  private conn: DatabaseConnection;

  constructor(conn: DatabaseConnection) {
    this.conn = conn;
  }

  async create(imageData: { data: Uint8Array; mimeType: string; filename?: string; size: number }): Promise<string> {
    const db = this.conn.getDb();
    const imageId = crypto.randomUUID();

    db.exec({
      sql: 'INSERT INTO images (id, data, mime_type, filename, size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      bind: [
        imageId,
        imageData.data,
        imageData.mimeType,
        imageData.filename || null,
        imageData.size,
        Date.now()
      ]
    });

    return imageId;
  }

  async get(imageId: string): Promise<any[] | null> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: 'SELECT * FROM images WHERE id = ?',
      bind: [imageId],
      returnValue: 'resultRows'
    });

    return result.length > 0 ? result[0] : null;
  }

  async delete(imageId: string): Promise<void> {
    const db = this.conn.getDb();
    db.exec({
      sql: 'DELETE FROM images WHERE id = ?',
      bind: [imageId]
    });
  }

  async getAllImages(): Promise<any[][]> {
    const db = this.conn.getDb();
    return db.exec({
      sql: 'SELECT * FROM images ORDER BY created_at DESC',
      returnValue: 'resultRows'
    });
  }
}