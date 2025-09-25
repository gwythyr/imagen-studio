import { GoogleGenAI, Type } from '@google/genai';
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
  private static readonly DEFAULT_MODEL = 'gemini-2.5-flash';
  private static readonly DEFAULT_THINKING_BUDGET = 0;

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
}