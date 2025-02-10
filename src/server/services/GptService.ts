import { OpenAI } from 'openai';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionTool } from 'openai/resources/chat/completions';
import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import { AcmeMethodName } from '@/shared/AnyCallableMethodEncyclopedia';
import { ACME } from '@/server/services/ACME';

export class GptService extends AbstractAiModelService {
  public provider = 'OpenAI';
  public model = 'gpt-4o';
  protected apiKey = process.env.OPENAI_API_KEY;

  declare public run: (
    body: ChatCompletionCreateParamsNonStreaming,
    options?: OpenAI.RequestOptions
  ) => Promise<any>;

  constructor(model?: string) {
    super(model);
    this.run = (request) =>
      this.client.chat.completions
        .create(request)
        .then((res: any) => JSON.parse(res.choices[0].message.tool_calls[0].function.arguments));
  }

  buildRequest({
    method,
    messages,
  }: {
    method: AcmeMethodName;
    messages: { user: string[]; model?: string[] };
  }): ChatCompletionCreateParamsNonStreaming {
    const methodDefinition = ACME[method];
    const { temperature = 1, frequency_penalty = 1 } = methodDefinition?.parameters ?? {};

    const userMessages = messages.user;

    const modelInstructions = [];
    if (messages.model) {
      modelInstructions.push(...messages.model);
    }

    modelInstructions.push(...ACME.getInstructions({ method }));

    return {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: modelInstructions.map((part) => ({ text: part.text, type: 'text' })),
        },
        { role: 'user', content: userMessages.map((text) => ({ text, type: 'text' })) },
      ],
      stream: false,
      temperature,
      frequency_penalty,
      response_format: { type: 'json_object' },
      tools: [methodDefinition.function_tool as ChatCompletionTool],
      tool_choice: { type: 'function', function: { name: methodDefinition.function_tool.function.name } },
    };
  }

  getClient(): OpenAI {
    return new OpenAI({ apiKey: this.apiKey });
  }
}
