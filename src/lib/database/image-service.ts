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

  async get(imageId: string): Promise<ImageRecord | null> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: 'SELECT * FROM images WHERE id = ?',
      bind: [imageId],
      returnValue: 'resultRows'
    });

    let image: ImageRecord | null = null;
    if (result.length > 0) {
      const row = result[0];
      image = {
        id: row[0] as string,
        data: new Uint8Array(row[1] as ArrayBuffer),
        mimeType: row[2] as string,
        filename: row[3] as string | null,
        size: row[4] as number,
        createdAt: row[5] as number
      };
    }
    return image;
  }

  async delete(imageId: string): Promise<void> {
    const db = this.conn.getDb();
    db.exec({
      sql: 'DELETE FROM images WHERE id = ?',
      bind: [imageId]
    });
  }
}