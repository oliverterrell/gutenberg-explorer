import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import { GeminiService } from '@/server/services/GeminiService';
import { GptService } from '@/server/services/GptService';

export const aiModelServiceFactory = (model: string): AbstractAiModelService => {
  if (model.startsWith('gpt-')) {
    /**
     * Chat GPT
     */
    return new GptService(model);
  } else if (model.startsWith('gemini-')) {
    /**
     * Gemini
     */
    return new GeminiService(model);
  }

  return null;
};
