import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import { GeminiService } from '@/server/services/GeminiService';
import { GptService } from '@/server/services/GptService';

export const aiModelServiceFactory = (model: string): AbstractAiModelService => {
  switch (model) {
    case 'gpt-4o':
      return new GptService(model);
    case 'gemini-1.5-flash':
    default:
      return new GeminiService(model);
  }
};
