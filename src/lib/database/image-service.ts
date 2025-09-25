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

    db.run(
      'INSERT INTO images (id, data, mime_type, filename, size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        imageId,
        imageData.data,
        imageData.mimeType,
        imageData.filename || null,
        imageData.size,
        Date.now()
      ]
    );

    return imageId;
  }

  async get(imageId: string): Promise<ImageRecord | null> {
    const db = this.conn.getDb();
    const stmt = db.prepare('SELECT * FROM images WHERE id = ?');
    stmt.bind([imageId]);

    let image: ImageRecord | null = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      image = {
        id: row.id as string,
        data: new Uint8Array(row.data as ArrayBuffer),
        mimeType: row.mime_type as string,
        filename: row.filename as string | null,
        size: row.size as number,
        createdAt: row.created_at as number
      };
    }

    stmt.free();
    return image;
  }

  async delete(imageId: string): Promise<void> {
    const db = this.conn.getDb();
    db.run('DELETE FROM images WHERE id = ?', [imageId]);
  }
}