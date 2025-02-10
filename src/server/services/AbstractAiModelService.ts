import { AnyFunction } from '@/shared';
import { AcmeBuildRequest } from '@/server/types';

/**
 * ✨🦄✨
 * -
 */
export abstract class AbstractAiModelService {
  public model: string;
  public provider: string;
  public client: any;
  protected clientOptions: Record<string, any>;
  protected apiKey: string;
  public run: AnyFunction;

  protected constructor(model?: string) {
    if (model) this.model = model;
    this.client = this.getClient();
  }

  abstract getClient(args?: any): any;

  abstract buildRequest({ method, messages, mediaArgs, parameters }: AcmeBuildRequest): any;

  async isExplicit(text: string): Promise<{ isExplicit: boolean }> {
    const request = await this.buildRequest({
      method: 'isExplicit',
      messages: {
        user: [text],
      },
    });

    return await this.run(request);
  }

  async alterSeed(seed: string | string[], theme?: string): Promise<{ text: string }> {
    if (!Array.isArray(seed)) {
      seed = [seed];
    }

    const messages = { user: seed } as any;

    if (theme) {
      messages.user.push(`# Fit this theme: ${theme}`);
    }

    const request = await this.buildRequest({
      method: 'alterSeed',
      messages,
    });

    return await this.run(request);
  }
}
