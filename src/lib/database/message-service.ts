import { type Message, type MessageType, type ImageContent } from '../../types/chat';
import { DatabaseConnection } from './connection';
import { ImageService } from './image-service';

export class MessageService {
  private conn: DatabaseConnection;
  private imageService: ImageService;

  constructor(conn: DatabaseConnection, imageService: ImageService) {
    this.conn = conn;
    this.imageService = imageService;
  }

  async add(sessionId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const db = this.conn.getDb();
    const fullMessage: Message = {
      id: crypto.randomUUID(),
      ...message
    };

    let imageId: string | null = null;
    if (fullMessage.imageContent) {
      imageId = await this.imageService.create({
        data: fullMessage.imageContent.data,
        mimeType: fullMessage.imageContent.mimeType,
        size: fullMessage.imageContent.data.length
      });
    } else if (fullMessage.imageData) {
      imageId = await this.imageService.create({
        data: fullMessage.imageData,
        mimeType: 'image/jpeg',
        size: fullMessage.imageData.length
      });
    }

    const sentToAi = fullMessage.role === 'user' ? (fullMessage.sentToAi ? 1 : 0) : 1;
    const sanitizedContent = fullMessage.content ?
      fullMessage.content.replace(/\0/g, '').replace(/[\uFFFE\uFFFF]/g, '') : null;

    db.run(
      'INSERT INTO messages (id, session_id, type, content, role, timestamp, image_id, audio_data, sent_to_ai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        fullMessage.id,
        sessionId,
        fullMessage.type,
        sanitizedContent,
        fullMessage.role,
        fullMessage.timestamp,
        imageId,
        fullMessage.audioData || null,
        sentToAi
      ]
    );

    db.run(
      'UPDATE sessions SET updated_at = ? WHERE id = ?',
      [Date.now(), sessionId]
    );

    return fullMessage;
  }

  async getAll(sessionId: string): Promise<Message[]> {
    const db = this.conn.getDb();
    const stmt = db.prepare(`
      SELECT
        m.*,
        i.data as image_data,
        i.mime_type as image_mime_type
      FROM messages m
      LEFT JOIN images i ON m.image_id = i.id
      WHERE m.session_id = ?
      ORDER BY m.timestamp ASC
    `);
    stmt.bind([sessionId]);

    const messages: Message[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();

      let imageContent: ImageContent | undefined;
      if (row.image_data && row.image_mime_type) {
        imageContent = {
          data: new Uint8Array(row.image_data as ArrayBuffer),
          mimeType: row.image_mime_type as string,
        };
      }

      messages.push({
        id: row.id as string,
        type: (row.type as MessageType) || 'text',
        content: row.content as string,
        role: row.role as 'user' | 'assistant',
        timestamp: row.timestamp as number,
        imageData: row.image_data ? new Uint8Array(row.image_data as ArrayBuffer) : undefined,
        audioData: row.audio_data ? new Uint8Array(row.audio_data as ArrayBuffer) : undefined,
        imageContent,
        sentToAi: Boolean(row.sent_to_ai)
      });
    }

    stmt.free();
    return messages;
  }

  async delete(messageId: string): Promise<void> {
    const db = this.conn.getDb();
    db.run('DELETE FROM messages WHERE id = ?', [messageId]);
  }

  async markSessionAsSent(sessionId: string): Promise<void> {
    const db = this.conn.getDb();
    db.run(
      'UPDATE messages SET sent_to_ai = 1 WHERE session_id = ? AND role = ?',
      [sessionId, 'user']
    );
  }
}