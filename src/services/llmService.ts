import { GoogleGenAI, Type, PersonGeneration } from '@google/genai';
import { type Message } from '../types/chat';
import { GeminiMessageProcessor } from '../lib/geminiMessageProcessor';
import { AI_INTERACTION_SYSTEM_PROMPT } from '../prompts/aiInteractionPrompt';

export interface LlmResponse {
  chatTitle?: string;
  imageGenerationPrompt?: string;
  comment?: string;
}

interface LlmServiceConfig {
  model?: string;
  thinkingBudget?: number;
}

export class LlmService {
  private static readonly DEFAULT_MODEL = 'gemini-2.5-pro';
  private static readonly DEFAULT_THINKING_BUDGET = -1;

  static async generateResponse(
    apiKey: string,
    messages: Message[],
    config: LlmServiceConfig = {}
  ): Promise<LlmResponse> {
    const ai = new GoogleGenAI({ apiKey });

    const modelConfig = {
      thinkingConfig: {
        thinkingBudget: config.thinkingBudget ?? this.DEFAULT_THINKING_BUDGET,
      },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        required: ["chatTitle", "imageGenerationPrompt"],
        properties: {
          chatTitle: {
            type: Type.STRING,
          },
          imageGenerationPrompt: {
            type: Type.STRING,
          },
          comment: {
            type: Type.STRING,
          },
        },
      },
      systemInstruction: [
        {
          text: AI_INTERACTION_SYSTEM_PROMPT,
        }
      ],
    };

    const model = config.model ?? this.DEFAULT_MODEL;
    const contents = GeminiMessageProcessor.processMessages(messages);

    const response = await ai.models.generateContent({
      model,
      config: modelConfig,
      contents,
    });

    if (!response.text) {
      throw new Error('No response text received from AI');
    }

    return JSON.parse(response.text) as LlmResponse;
  }

  static async generateImage(apiKey: string, prompt: string): Promise<Uint8Array | null> {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: 'models/imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        personGeneration: PersonGeneration.ALLOW_ADULT,
        aspectRatio: '1:1',
      },
    });

    if (!response?.generatedImages?.[0]?.image?.imageBytes) {
      return null;
    }

    const base64Data = response.generatedImages[0].image.imageBytes;
    const binaryString = atob(base64Data);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }
    return imageBytes;
  }
}
