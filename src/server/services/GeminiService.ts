import { AbstractAiModelService } from '@/server/services/AbstractAiModelService';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import {
  Part,
  Content,
  FileDataPart,
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
import { GoogleAIFileManager, FileMetadataResponse } from '@google/generative-ai/server';
import { ACME } from '@/server/services/ACME';

export class GeminiService extends AbstractAiModelService {
  public provider = 'google';
  public model = 'gemini-1.5-flash';
  public fileManager = null as GoogleAIFileManager;
  public withFileClient: GenerativeModel;

  protected fileUploadEndpoint = 'https://generativelanguage.googleapis.com/upload/v1beta/files';

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

  protected apiKey = process.env.GOOGLE_CLOUD_GEMINI_KEY;

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

  async getUploadUrl({ googleFileId, contentType, contentLength }): Promise<string> {
    const response = await axios.post(
      `${this.fileUploadEndpoint}?key=${this.apiKey}`,
      { file: { displayName: googleFileId } },
      {
        headers: {
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': contentLength.toString(),
          'X-Goog-Upload-Header-Content-Type': contentType,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.headers['x-goog-upload-url'];
  }

  getFileDataPart(file: FileMetadataResponse): FileDataPart {
    return {
      fileData: {
        fileUri: file.uri,
        mimeType: file.mimeType,
      },
    } as FileDataPart;
  }

  async buildRequest({ method, messages, mediaArgs }: AcmeBuildRequest): Promise<GenerateContentRequest> {
    const userFileDataParts: Part[] = [];

    if (mediaArgs) {
      try {
        if (mediaArgs.googleFile || mediaArgs.google4xVideo) {
          if (mediaArgs.google4xVideo) {
            userFileDataParts.push(
              this.getFileDataPart(mediaArgs.google4xVideo),
              this.getFileDataPart(mediaArgs.googleAudio)
            );
          } else {
            userFileDataParts.push(this.getFileDataPart(mediaArgs.googleFile));
          }
        } else {
          userFileDataParts.push(this.getFileUploadErrorPart());
        }
      } catch (e) {
        userFileDataParts.push(this.getFileUploadErrorPart());
      }
    }

    const modelInstructions = messages.model ?? [];

    const modelParts = ACME.getInstructions({
      method,
      mediaArgs,
    }).concat(modelInstructions.map((text) => ({ text }))) as Part[];

    const userParts = userFileDataParts.concat(messages.user.map((text) => ({ text }))) as Part[];

    return {
      contents: [
        { role: 'model', parts: modelParts },
        { role: 'user', parts: userParts },
      ] as Content[],
    } as GenerateContentRequest;
  }
}
