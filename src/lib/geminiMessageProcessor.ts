import { type Message } from '../types/chat';

export interface GeminiPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export class GeminiMessageProcessor {
  static processMessages(messages: Message[]): GeminiMessage[] {
    return messages
      .filter(msg => msg.content || msg.audioData || msg.imageContent)
      .map(msg => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const parts: GeminiPart[] = [];

        if (msg.content) {
          parts.push({
            text: msg.content,
          });
        }

        if (msg.audioData) {
          const base64String = this.uint8ArrayToBase64(msg.audioData);
          parts.push({
            inlineData: {
              data: base64String,
              mimeType: 'audio/ogg',
            },
          });
        }

        if (msg.imageContent) {
          const base64String = this.uint8ArrayToBase64(msg.imageContent.data);
          parts.push({
            inlineData: {
              data: base64String,
              mimeType: msg.imageContent.mimeType,
            },
          });
        }

        return {
          role: role as 'user' | 'model',
          parts,
        };
      });
  }

  private static uint8ArrayToBase64(uint8Array: Uint8Array): string {
    const binaryString = Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('');
    return btoa(binaryString);
  }
}