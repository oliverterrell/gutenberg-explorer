import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import { ClaudeService } from '@/server/services/ClaudeService';
import { GeminiService } from '@/server/services/GeminiService';
import { GptService } from '@/server/services/GptService';

export const aiModelServiceFactory = (model: string): AbstractAiModelService => {
  switch (model) {
    case 'claude-3-5-sonnet-20241022':
      return new ClaudeService(model);
    case 'gpt-4o':
      return new GptService(model);
    case 'gemini-1.5-flash':
    default:
      return new GeminiService(model);
  }
};
