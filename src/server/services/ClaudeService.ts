import { Anthropic } from '@anthropic-ai/sdk';
import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import { AcmeBuildRequest } from '@/server/types';
import { ACME } from '@/server/services/ACME';

export class ClaudeService extends AbstractAiModelService {
  public provider = 'Anthropic';
  public model = 'claude-3-5-sonnet-20241022';
  protected apiKey = process.env.ANTHROPIC_API_KEY;

  declare public run: (request: Anthropic.MessageCreateParams) => Promise<Anthropic.Message>;

  constructor(model?: string) {
    super(model);
    this.run = async (request?: Anthropic.MessageCreateParams) => {
      return await this.client.messages.create(request).then((res: Anthropic.Message) => {
        return (res.content[0] as any).input;
      });
    };
  }

  getClient(): Anthropic {
    return new Anthropic({ apiKey: this.apiKey });
  }

  buildRequest({
    method,
    messages,
    parameters: inputParameters,
  }: AcmeBuildRequest): Anthropic.MessageCreateParams {
    const {
      function_tool: {
        function: { name, parameters, description },
      },
      systemInstruction,
      modelHelperInstructions,
    } = ACME[method];

    const { max_tokens = 1024 } = { ...parameters, ...inputParameters };

    const userMessages = messages.user;

    const modelInstructions = [];
    if (messages.model) {
      modelInstructions.push(...messages.model.map((msg) => ({ role: 'assistant', content: msg })));
    }

    modelInstructions.push(
      ...ACME.getInstructions({ method }).map((instr) => ({ role: 'assistant', content: instr.text }))
    );

    if (modelHelperInstructions?.claude) {
      modelInstructions.push(
        ...modelHelperInstructions.claude.map((content: string) => ({ role: 'assistant', content }))
      );
    }

    return {
      model: this.model,
      messages: [...modelInstructions, ...userMessages.map((msg) => ({ role: 'user', content: msg }))],
      stream: false,
      max_tokens,
      tools: [{ name, description: `${description} ${systemInstruction}`, input_schema: parameters }],
      tool_choice: { type: 'tool', name },
    };
  }
}
