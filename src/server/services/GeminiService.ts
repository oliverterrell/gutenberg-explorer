import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import {
  Part,
  Content,
  HarmCategory,
  SafetySetting,
  RequestOptions,
  GenerativeModel,
  GenerationConfig,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  GenerateContentResult,
  GenerateContentRequest,
} from '@google/generative-ai';
import { AcmeBuildRequest } from '@/server/types';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { ACME } from '@/server/services/ACME';

export class GeminiService extends AbstractAiModelService {
  public provider = 'google';
  public model = 'gemini-1.5-flash';
  protected apiKey = process.env.GOOGLE_API_KEY;
  public fileManager = null as GoogleAIFileManager;
  public withFileClient: GenerativeModel;

  protected clientOptions = {
    generationConfig: {
      responseMimeType: 'application/json',
    } as GenerationConfig,

    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ] as SafetySetting[],
  };

  declare public run: (request: GenerateContentRequest, requestOptions?: RequestOptions) => Promise<any>;

  constructor(model?: string) {
    super(model);

    this.client = this.getClient();
    this.fileManager = this.getFileManager();
    this.withFileClient = this.getWithFileClient();

    this.run = async (request: GenerateContentRequest) => {
      let client: GenerativeModel;

      if (
        request?.contents?.length > 0 &&
        request.contents.find((content) => content?.role === 'user') &&
        request.contents
          .find((content) => content?.role === 'user')
          .parts.filter((userPart) => !!userPart?.fileData).length > 0
      ) {
        client = this.withFileClient;
      } else {
        client = this.client;
      }

      return await client.generateContent
        .bind(client)(request)
        .then((res: GenerateContentResult) => JSON.parse(res.response.text()));
    };
  }

  getClient(): GenerativeModel {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    return genAI.getGenerativeModel({
      model: this.model,
      ...this.clientOptions,
    });
  }

  getWithFileClient(): GenerativeModel {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    return genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      ...this.clientOptions,
    });
  }

  getFileManager(): GoogleAIFileManager {
    return new GoogleAIFileManager(this.apiKey);
  }

  async buildRequest({ method, messages }: AcmeBuildRequest): Promise<GenerateContentRequest> {
    const modelInstructions = messages.model ?? [];

    const modelParts = ACME.getInstructions({
      method,
    }).concat(modelInstructions.map((text) => ({ text }))) as Part[];

    const userParts = messages.user.map((text) => ({ text })) as Part[];

    return {
      contents: [
        { role: 'model', parts: modelParts },
        { role: 'user', parts: userParts },
      ] as Content[],
    } as GenerateContentRequest;
  }
}
