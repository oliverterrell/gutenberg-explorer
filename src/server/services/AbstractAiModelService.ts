import { AnyFunction } from '@/shared';
import { AcmeBuildRequest } from '@/server/types';
import { Book } from '@prisma/client';

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

  async parseAuthor(book: Book): Promise<{ author: string }> {
    const request = await this.buildRequest({
      method: 'parseAuthor',
      messages: {
        user: [JSON.stringify(book)],
      },
    });

    return await this.run(request);
  }

  async getBig5Summary(text: string, big5: Record<string, number>): Promise<{ summary: string }> {
    const userMessages = [
      `---\n# Text:\n${text}\n`,
      `---\n# Big 5 Personality Traits:\n${JSON.stringify(big5)}\n`,
    ];

    const request = await this.buildRequest({
      method: 'big5Summary',
      messages: {
        user: userMessages,
      },
    });

    return await this.run(request);
  }

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
