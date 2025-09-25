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

    db.exec({
      sql: 'INSERT INTO messages (id, session_id, type, content, role, timestamp, image_id, audio_data, sent_to_ai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      bind: [
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
    });

    db.exec({
      sql: 'UPDATE sessions SET updated_at = ? WHERE id = ?',
      bind: [Date.now(), sessionId]
    });

    return fullMessage;
  }

  async getAll(sessionId: string): Promise<Message[]> {
    const db = this.conn.getDb();
    const result = db.exec({
      sql: `
        SELECT
          m.*,
          i.data as image_data,
          i.mime_type as image_mime_type
        FROM messages m
        LEFT JOIN images i ON m.image_id = i.id
        WHERE m.session_id = ?
        ORDER BY m.timestamp ASC
      `,
      bind: [sessionId],
      returnValue: 'resultRows',
      columnNames: true
    });

    const messages: Message[] = result.map((row: any[]) => {
      let imageContent: ImageContent | undefined;
      if (row[9] && row[10]) { // image_data and image_mime_type columns
        imageContent = {
          data: new Uint8Array(row[9] as ArrayBuffer),
          mimeType: row[10] as string,
        };
      }

      return {
        id: row[0] as string,
        type: (row[2] as MessageType) || 'text',
        content: row[3] as string,
        role: row[4] as 'user' | 'assistant',
        timestamp: row[5] as number,
        imageData: row[9] ? new Uint8Array(row[9] as ArrayBuffer) : undefined,
        audioData: row[7] ? new Uint8Array(row[7] as ArrayBuffer) : undefined,
        imageContent,
        sentToAi: Boolean(row[8])
      };
    });
    return messages;
  }

  async delete(messageId: string): Promise<void> {
    const db = this.conn.getDb();
    db.exec({
      sql: 'DELETE FROM messages WHERE id = ?',
      bind: [messageId]
    });
  }

  async markSessionAsSent(sessionId: string): Promise<void> {
    const db = this.conn.getDb();
    db.exec({
      sql: 'UPDATE messages SET sent_to_ai = 1 WHERE session_id = ? AND role = ?',
      bind: [sessionId, 'user']
    });
  }
}