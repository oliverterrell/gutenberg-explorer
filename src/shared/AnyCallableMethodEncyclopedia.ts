/**
 * This is the `ChatCompletionTool` type from OpenAI
 * -
 * or at least how that type is used in this app. Some of the unused union types cause theirs to
 * not play nice when casting the "function" property to Gemini's FunctionDeclarationTool type.
 *
 * While it's more clear to use the OpenAI type directly, this type appeases the TypeScript compiler
 * making dev process less of a pain.
 *
 * _Anyone familiar with the OpenAi Node client should have no trouble writing an A.C.M.E. definition._
 */
export interface AcmeFunctionTool {
  type: string;
  function: AcmeFunctionSignature;
}

export interface AcmeFunctionSignature {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description: string;
        items?: {
          type: string;
          description: string;
          properties?: object;
          required?: string[];
        };
      }
    >;
    required: string[];
  };
}

export interface AcmeParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export type SystemInstruction = string;

export interface AcmeDefinition {
  function_tool: AcmeFunctionTool;
  parameters?: AcmeParameters;
  systemInstruction: SystemInstruction;
  modelHelperInstructions?: {
    gpt?: SystemInstruction[];
    gemini?: SystemInstruction[];
  };
}

const getAnyCallableMethodEncyclopedia = (): Record<string, AcmeDefinition> => {
  return {
    alterSeed: {
      function_tool: {
        type: 'function',
        function: {
          name: 'alterSeed',
          description: 'Alter a seed to create a novel representation with the same net effect.',
          parameters: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: `The altered version of the seed, maintaining the same sentiment, effect, and purpose.`,
              },
            },
            required: ['text'],
          },
        } as AcmeFunctionSignature,
      } as AcmeFunctionTool,
      systemInstruction:
        `Using the input seed, (or select one of your choice if it is an array of seeds), create a novel representation of that seed. Your response text has the same effect, just said in a slightly different way. Return a JSON object of the shape { text: string } The length of your generated text should be more or less the same as that of the input. Please ensure it sounds like it was spoken by someone other than who wrote it. If the seed is a question, don't answer it - just ask the question in a new way.` as SystemInstruction,
      modelHelperInstructions: {
        gemini: [
          `## ARRAYS: If the input is array format, randomly select only one to base your modification on and ignore the rest.` as SystemInstruction,
          `## LENGTH: Your response should be as short as the input seed or one of the input seeds.` as SystemInstruction,
        ],
      },
      parameters: {
        temperature: 0.9,
        frequency_penalty: 1,
      } as AcmeParameters,
    } as AcmeDefinition,

    isExplicit: {
      function_tool: {
        type: 'function',
        function: {
          name: 'isExplicit',
          description: `Return true if the user text contains hate speech or explicit content.`,
          parameters: {
            type: 'object',
            properties: {
              isExplicit: {
                type: 'boolean',
                description: 'A flag that is true if the content has either hate speech or explicit content.',
              },
            },
            required: ['isExplicit'],
          },
        },
      },
      systemInstruction: `You are given a chunk of text. Parse it looking for any hate speech or explicit content and return a
        JSON object of the shape { isExplicit: boolean } where isExplicit is true if the content contains either one. As a guide, PG-13
        rated content is okay. If the suspected offensive content is within a normal context (e.g. "Adolf Woodcock" could be someone's
        actual name), then it is okay. Only target the explicit bad stuff that is above a PG-13 threshold.`,
    },
  };
};

/**
 * <b style="font-size:12px;padding-right:2px;">A.C.M.E.</b> _Backend api 🧨_
 */
export const AnyCallableMethodEncyclopedia = {
  ...getAnyCallableMethodEncyclopedia(),
} as ReturnType<typeof getAnyCallableMethodEncyclopedia>;

export type AcmeMethodName = String & keyof ReturnType<typeof getAnyCallableMethodEncyclopedia>;
