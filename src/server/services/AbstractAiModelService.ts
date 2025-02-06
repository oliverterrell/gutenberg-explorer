import { GenerateContentRequest, TextPart } from '@google/generative-ai';
import { InstructionService } from '@/server/services/InstructionService';
import { ACME } from '@/server/services/ACME';
import { sleep, AnyFunction } from '@/shared';
import lodash from 'lodash';
import { AcmeBuildRequest } from '@/server/types';
import { GeminiService } from '@/server/services/GeminiService';

export type LlmResponseEvaluateChallengeEntry = {
  commentary: string;
  score: number;
  transcript?: string;
};

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

  getFileUploadErrorPart(): TextPart {
    return {
      text: `
        <OOC_PLEASE_HEED_VERY_IMPORTANT>
          There was an error processing the video submission.
          Please explain to the user that there was a technical error
          and apologize for it.
          Explain how you wish you could see what they had to show, and
          that unfortunately you must award them zero points. Return a string
          containing graceful commentary about the situation.
        </OOC_PLEASE_HEED_VERY_IMPORTANT>
      `,
    };
  }

  async generateChallengeIdea(
    brand: string,
    previouslyGenerated?: string,
    chooseFromSets?: Record<string, any>
  ): Promise<any> {
    const userMessages = [`# Brand to generate for: ${brand}`];

    if (previouslyGenerated) {
      userMessages.push(
        `## Previously generated challenges (make something different from this): ${previouslyGenerated}`
      );
    }

    if (chooseFromSets && Math.random() < 0.777) {
      Object.entries(chooseFromSets).forEach(([key, val]) => {
        userMessages.push(
          `### You must choose ONLY from the following ${lodash.startCase(key)}s when generating associated values: ${JSON.stringify(val)}.`
        );
      });
    }

    const request = await this.buildRequest({
      method: 'generateChallengeIdea',
      messages: { user: userMessages },
    });

    return await this.run(request);
  }

  async generateExpressionGame(
    challengeIdea: any
  ): Promise<Partial<any> & { autoSubmitTimer: number; promptText: string; judges: any[] }> {
    const userMessages = [
      `---\n# Use the following challenge idea as the basis for creating this game.
        ADHERE VERY CLOSELY to how it is described:\n\n ${JSON.stringify(challengeIdea)}`,
    ];

    const request = await this.buildRequest({
      method: 'generateExpressionGame',
      messages: { user: userMessages },
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

  async getCommentary({ aiJudgeResponses, panelist }): Promise<{ commentary: string }> {
    const request = await this.buildRequest({
      method: 'getCommentary',
      messages: {
        user: [
          InstructionService.getJudgePersonaInstructions({
            aiJudgeArgs: { ...panelist },
          }),
          ...aiJudgeResponses.map((resp: any) => `## Commentary: ${resp.text}`),
        ],
      },
    });

    return await this.run(request);
  }

  async getJudgeIntro(args: {
    aiJudge: any;
    customInstructions: string;
  }): Promise<{ easy: string; medium: string; hard: string }> {
    const { aiJudge, customInstructions } = args;

    const request = await this.buildRequest({
      method: 'getJudgeIntro',
      messages: {
        user: [
          InstructionService.getJudgePersonaInstructions({
            aiJudgeArgs: { aiJudge },
          }),
          `${customInstructions}`,
        ],
      },
    });

    return await this.run(request).catch((_: any) => {});
  }

  async evaluateChallengeEntry(
    { game, aiJudgeArgs, scoringConfig, userSubmission, mediaArgs, prompt }: any,
    forceBackupRequest = false
  ): Promise<LlmResponseEvaluateChallengeEntry> {
    let service: GeminiService;

    const requestArgs = { method: 'evaluateChallengeEntry' } as AcmeBuildRequest;

    const userMessages = [
      InstructionService.getJudgePersonaInstructions({ aiJudgeArgs, scoringConfig }),
      InstructionService.getChallengeDescription({ prompt }),
      InstructionService.getJudgeRoleGuidelines({ game, aiJudgeArgs }),
    ];

    if (mediaArgs && (mediaArgs.mimeType.startsWith('video/') || mediaArgs.google4xVideo)) {
      service = new GeminiService('gemini-1.5-flash-latest');
      requestArgs.mediaArgs = mediaArgs;
      userMessages.push(
        !!mediaArgs.google4xVideo
          ? '---\n# USER SUBMISSION:\nattached video (4x slowed down for better accuracy) and audio (normal speed) were split from the same original recording, submitted by user together as one initial recording. Process them separately knowing they go together at the same (1x) speed.'
          : '---\n# USER SUBMISSION:\nattached video.'
      );
    } else {
      service = this as unknown as GeminiService;
      userMessages.push(InstructionService.getUserSubmission({ userSubmission }));
      if (scoringConfig.operator !== 'ScoringType.ModelEval') {
        userMessages.push(InstructionService.getCorrectAnswer({ prompt, scoringConfig }));
      }
    }

    requestArgs.messages = {
      user: userMessages,
      model: [InstructionService.getChallengeDescription({ prompt })],
    };

    if (scoringConfig) {
      userMessages.push(InstructionService.getScoringInstructions({ scoringConfig }));
    }

    const request = await service.buildRequest(requestArgs);

    const runBackupRequest = async (request) => {
      console.log(`errored response from model. modifying request`);

      const newUserParts = [
        this.getFileUploadErrorPart(),
        ...request.contents
          .find((con) => con.role === 'user')
          .parts.filter((part) => typeof part.fileData === 'undefined'),
      ];

      const newModelParts = [
        this.getFileUploadErrorPart(),
        ...request.contents.find((con) => con.role === 'model').parts,
      ];

      const newRequest: GenerateContentRequest = {
        ...request,
        contents: [
          { role: 'model', parts: newModelParts },
          { role: 'user', parts: newUserParts },
        ],
      };

      // console.log(RB('=== SYSTEM ==='));
      // console.log(JSON.stringify(ARV.vals(newRequest.contents.find((con) => con.role === 'model'))));
      // console.log(RB('=== USER ==='));
      // console.log(JSON.stringify(ARV.vals(newRequest.contents.find((con) => con.role === 'user'))));

      return await service.run(newRequest);
    };

    const runRequest = async (request: GenerateContentRequest | any, counter = 0) => {
      return await (service as GeminiService).run(request).catch(async (_) => {
        console.log('caught inside run request', _);
        if (counter < 3) {
          counter++;
          console.log(`retry #${counter}: ${aiJudgeArgs.aiJudge.name}`);

          await sleep(0.5);

          return await runRequest(request, counter);
        } else if (mediaArgs && mediaArgs.mimeType.startsWith('video/')) {
          return await runBackupRequest(request);
        } else {
          return {
            score: 0,
            transcript: '...',
          };
        }
      });
    };

    return forceBackupRequest
      ? await runBackupRequest(request)
      : await runRequest(request).catch(async (_) => {
          console.log('caught at call time', _);
          return Object.fromEntries(
            Object.entries(
              ACME[request.toolConfig.functionCallingConfig.allowedFunctionNames[0]].function_tool.function
                .parameters.properties
            ).map(([key, val]: [string, any]) => {
              return [
                key,
                val.type === 'string' ? '...' : val.type === 'number' ? 0 : val.type === 'boolean' ? true : '...',
              ];
            })
          );
        });
  }
}
