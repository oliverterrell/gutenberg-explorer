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

    parseAuthor: {
      function_tool: {
        type: 'function',
        function: {
          name: 'parseAuthor',
          description: `Return the author or author's name(s) in a simple string format for display on a webpage.`,
          parameters: {
            type: 'object',
            properties: {
              author: {
                type: 'string',
                description: 'The simplified string of author or authors names',
              },
            },
            required: ['author'],
          },
        },
      },
      systemInstruction: `Given book info, return a simplified string of the author or author's names.
      For example, if the author is listed as ["Carroll, Lewis"], then return { author: "Lewis Carroll" }.
      If the authors are listed as ["Carroll, Lewis", "Stetson, Björn"] then return { author: "Lewis Carroll & Björn Stetson" }.
      For other variations on authorship, follow these guidelines to return something simple and pleasing to the eye in string format.
      Your response should be a JSON object of the shape { author: string }.`,
    },

    musicalTheatreAnalysis: {
      function_tool: {
        type: 'function',
        function: {
          name: 'musicalTheatreAnalysis',
          description:
            'Determine what genre of music this book would be if it were a musical theatre production. Also choose 1-5 celebrities to play key roles in the production.',
          parameters: {
            type: 'object',
            properties: {
              genre: {
                type: 'string',
                description: 'What genre this book would be if it were a musical theatre production.',
              },
              celebrityRoles: {
                type: 'array',
                description: 'An array of famous celebrities matched to their parts in the musical.',
                items: {
                  type: 'object',
                  description: 'A celebrity and their role in the musical version of the book.',
                  properties: {
                    celebrity: {
                      type: 'string',
                      description: 'The name of a famous celebrity.',
                    },
                    role: {
                      type: 'string',
                      description: 'The role in the band or musical this celebrity will play.',
                    },
                  },
                },
              },
              summary: {
                type: 'string',
                description:
                  'A brief, few sentence summary highlighting specifics of the text that led to the results seen in the associated musical theatre analysis.',
              },
            },
            required: ['celebrityRoles', 'genre', 'summary'],
          },
        },
      },
      systemInstruction: `You are given a chunk of text. Read through the text and determine what genre of music or musical theatre this book would be.
      Once the genre is chosen, come up with 1-5 famous celebrities and give them key roles based on the text. Have some fun with this! Goofy answers are appreciated.
      Also return a brief, few sentence summary describing specifics within or about the text that led to the the chosen genre and celebrity roles.
      Keep your summary to a couple sentences. You don't need to touch on everything. Be nice, and touch on at least a few of the choices, or describe them all if you wish.
      Your response should be a JSON object of the shape { genre: string, celebrityRoles: { celebrity: string, role: string }[], summary: string }.
      When referencing choices, don't use words like "I". Just describe how the genre and celebrity roles go with the text, regardless of who chose them.`,
    },

    colorPaletteAnalysis: {
      function_tool: {
        type: 'function',
        function: {
          name: 'colorPaletteAnalysis',
          description: 'Generate a color palette that would go great with the provided book.',
          parameters: {
            type: 'object',
            properties: {
              colorPalette: {
                type: 'array',
                description: 'An array of colors comprising the chosen color palette.',
                items: {
                  type: 'object',
                  description: 'A human readable name and associated hex code for one of the colors.',
                  properties: {
                    color: {
                      type: 'string',
                      description: 'Human-readable name of the color, like you might see on a paint swatch.',
                    },
                    hexCode: {
                      type: 'string',
                      description: 'A hex-code for the color that can be put directly into inline CSS styling.',
                    },
                  },
                },
              },
              summary: {
                type: 'string',
                description:
                  'A brief, few sentence summary highlighting specifics of the text that led to the results seen in the associated color palette analysis.',
              },
            },
            required: ['colorPalette', 'summary'],
          },
        },
      },
      systemInstruction: `You are given a chunk of text. Read through the text and generate a color palette that suits the emotion and content of the text perfectly.
      Your color palette should be between 3-5 colors. Also return a brief, few sentence summary describing specifics within or about the text
      that led to the the chosen colors. Describe what parts of the communication style or wording might correspond to certain colors, and why.
      Keep your summary to a couple sentences. You don't need to touch on everything. Be nice, and touch on at least two notable colors, or describe them all if you wish.
      Your response should be a JSON object of the shape { colorPalette: { color: string, hexCode: string }[], summary: string }. When referencing chosen colors, don't use words like "I". Just describe how the colors go with the text, regardless of who chose them.`,
    },

    big5Summary: {
      function_tool: {
        type: 'function',
        function: {
          name: 'big5Summary',
          description: `Return a brief summary explaining how specifics of the text lead to the results seen in the Big 5 Personality Traits analysis.`,
          parameters: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description:
                  'A brief, few sentence summary highlighting specifics of the text that led to the results seen in the associated Big 5 analysis.',
              },
            },
            required: ['summary'],
          },
        },
      },
      systemInstruction: `You are given a chunk of text and associated Big 5 Personality Traits analysis results. Read through the text and find specifics within it or about it
      that led to the results seen in the analysis results. Describe what parts of the communication style or wording might correspond to scores that stand out, and why.
      Keep your response to a couple sentences. You don't need to touch on everything. Be nice, and touch on at least two notable big five traits, high or low.
      Don't reference "data" in your response, instead keep the focus on the words. Your response should be a JSON object of the shape { summary: string }.`,
    },

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
