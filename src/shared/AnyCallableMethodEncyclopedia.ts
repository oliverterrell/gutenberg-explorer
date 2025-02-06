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
    generateExpressionGame: {
      function_tool: {
        type: 'function',
        function: {
          name: 'generateExpressionGame',
          description: 'Generate most of what is needed for a a playable Expression-type game.',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the game. Must be between 2 and 35 characters.',
              },
              description: {
                type: 'string',
                description:
                  'Description shown by the game name when advertised on a GameCard. Must be between 5 and 150 characters.',
              },
              howToScore: {
                type: 'string',
                description:
                  'A blurb on how to score, shown in introductory game information. Must be between 5 and 130 characters.',
              },
              howToWin: {
                type: 'string',
                description:
                  'A blurb on how to win, shown in introductory game information. Must be between 5 and 160 characters.',
              },
              introduction: {
                type: 'string',
                description:
                  'A blurb introducing the game, slightly longer than the description. Must be under 245 characters.',
              },
              minutesNeeded: {
                type: 'number',
                description:
                  'An integer shows in introductory game information giving a high-level look at how long it should take on average to play the challenge.',
              },
              autoSubmitTimer: {
                type: 'number',
                description:
                  'Number of seconds on the timer before the video submission auto-submits. One of 30, 60, 90, or 120',
              },
              promptText: {
                type: 'string',
                description:
                  'The prompt shown to the user when playing the challenge. This is what they will be judged against. It will be shown on a mobile device and needs to be under 118 characters.',
              },
              primaryColor: {
                type: 'string',
                description:
                  'A hex-6 color value that will be used widely across the app and share link metadata that goes perfectly with the game.',
              },
              secondaryColor: {
                type: 'string',
                description: 'A complimentary color to complement the primary color. Not widely used.',
              },
            },
            required: [
              'name',
              'description',
              'howToScore',
              'howToWin',
              'introduction',
              'minutesNeeded',
              'autoSubmitTimer',
              'promptText',
              'primaryColor',
              'secondaryColor',
            ],
          },
        },
      },
      systemInstruction: `Create a fun mobile-web game that will have a user recording a 30 sec - 2 min video in response to a challenge prompt. Your response should be a JSON object of the following shape:
      {
        name: Name for the challenge. Widely displayed in-app and when game is shared. Hard limit of 35 characters.
        description: A brief description of the game, shown alongside the name and cover art in many places. Hard limit of 150 characters.
        howToScore: A high-level blurb outlining the scoring structure. Hard limit of 150 characters
        howToWin: A blurb advertising how a player can win the game. Hard limit of 160 characters
        introduction: Once user chooses a game, they will be able to read this nice intro to the challenge. Like the description except where that is brief, this can be a bit longer. Hard limit of 225 characters.
        minutesNeeded: High-level metadata shown as a guide when users are browsing games.
        autoSubmitTimer: How long the user has (in seconds) to complete their challenge submission once started. Should be between 30 and 120 seconds.
        promptText: The text shown to the user at game time, when they start the challenge. This is how they will know what to do and what they will submit based on. Hard limit of 118 characters, as this will be displayed on a mobile screen where space is limited.
        judges: An array (min 1, max 3) of JSON objects with the shape { name: string, trait: string, difficulty: 0|1|2 as number } that defines how this competition will be judged and by who.
        primaryColor: A hex-6 color value, widely displayed in-app and when game is shared. Very important branding choice. Make it alluring!.,
        secondaryColor: A hex-6 color value to complement the primary. Should be less of an opposing color and more of a different shade or mood near to the primary color. Not widely used.
      }
     `,
    },
    generateChallengeIdea: {
      function_tool: {
        type: 'function',
        function: {
          name: 'generateChallengeIdea',
          description: `Generate a challenge concept for a specified company in spreadsheet format`,
          parameters: {
            type: 'object',
            properties: {
              brand: {
                type: 'string',
                description: 'The brand or brand entity this challenge is created for.',
              },
              theme: {
                type: 'string',
                description: 'A catchy few-word theme for the challenge.',
              },
              description: {
                type: 'string',
                description: 'A brief description of the challenge, advertising it to users concisely.',
              },
              category: {
                type: 'string',
                description: 'The market category this challenge would fall under.',
              },
              inputFormats: {
                type: 'array',
                description:
                  'Array of input formats, comprised by choosing some of the following: "Video", "Photo", "Voice", "Text", "Drawing".',
                items: {
                  type: 'string',
                  description: 'An input format. One of "Video", "Photo", "Voice", "Text", "Drawing".',
                },
              },
              aiFeatures: {
                type: 'array',
                description: 'Array of example features exclusively gained by using AI in this challenge.',
                items: {
                  type: 'string',
                  description: 'A useful feature exclusively available from using AI.',
                },
              },
              dataPoints: {
                type: 'array',
                description: 'Array of example data points a brand can track by hosting this challenge.',
                items: {
                  type: 'string',
                  description: 'A data point a company can track by hosting this challenge.',
                },
              },
              brandObjectives: {
                type: 'string',
                description:
                  'A sentence or two about what brand objectives hosting this challenge will solve for.',
              },
              customerInsights: {
                type: 'string',
                description:
                  'A sentence or two about what insights a brand may gain about customers from hosting this challenge.',
              },
              examplePrompt: {
                type: 'string',
                description: 'An example sentence or two shown to the user at the start of the challenge.',
              },
              scoringFormat: {
                type: 'string',
                description: 'A one-sentence outline of how this competition may be scored.',
              },
              exampleJudges: {
                type: 'array',
                description: 'Array of example AI Judges and their categories.',
                items: {
                  type: 'object',
                  description: 'AI Judge and category',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name of AI Judge',
                    },
                    category: {
                      type: 'string',
                      description: 'Category/Trait this judge is judging for',
                    },
                  },
                },
              },
              coverArtPrompt: {
                type: 'string',
                description:
                  'A prompt that will be sent to Dall-E-3 or other generative image AI Model to create the cover art used widely for this specific game.',
              },
            },
            required: [
              'brand',
              'theme',
              'description',
              'category',
              'inputFormats',
              'aiFeatures',
              'dataPoints',
              'brandObjectives',
              'customerInsights',
              'examplePrompt',
              'scoringFormat',
              'exampleJudges',
              'coverArtPrompt',
            ],
          },
        },
      },
      systemInstruction: `Generate a challenge concept for a specified company in spreadsheet format. The challenge concept should be fun, engaging, and drive user participation, with AI capabilities to track scoring and real-time feedback. Additionally, include celebrity AI judges (real or fictional) to enhance engagement. Your response should be a JSON object of the following shape:
        {
          brand: The brand or sponsor the challenge is created for. (e.g. Nike, Home Depot, ABIA Parking Management, etc.). This will likely be a reduced or simplified version of the related input value.
          theme: A catchy title or theme for the challenge.
          description: A brief explanation of the challenge and how it engages participants. Hard limit of 150 characters.
          category: The main category for the challenge (e.g., Fitness, DIY, Creative, Educational, etc.).
          inputFormats: The primary input format (e.g., Video, Photo, Text).
          aiFeatures: Describe how AI is incorporated into the challenge (e.g., AI judging, tracking, real-time feedback).
          dataPoints: List 1-4 unique data points that can be extracted from participant submissions (e.g., creativity, engagement, accuracy, etc.).
          brandObjectives: The key business goals the challenge is designed to achieve (e.g., product awareness, engagement, data collection).
          customerInsights: Behavioral insights or preferences that the brand can learn from participants.
          examplePrompt: A sample challenge prompt to inspire participants. Hard limit of 118 characters.
          scoringFormat: Suggest a scoring format (e.g., 1-100 points for creativity, 1-100 points for product use, etc.).
          exampleJudges: List 2-3 celebrity AI judges (can be fictional or real, but try to use names of real celebrities. When using real names, don't add anything to the name - just give it directly), along with their specific judgment categories (e.g., Creativity, Style, Execution).
          coverArtPrompt: Using the challenge that could be created from other data in this object: Create a vibrant and exciting cover art for the [Brand/Sponsor] "[Challenge Theme]" competition. The design should incorporate the iconic colors of the [Brand/Sponsor], blending seamlessly to create a sense of energy and fun. At the center, feature [Key Visual Element Related to the Challenge] prominently, captured in action to reflect the challenge's competitive and fun nature. The background should include a few well-placed playful, dynamic elements such as [Challenge-Related Icon or Pattern], a stopwatch icon, or minimalist abstract linework to evoke movement and excitement. Include a single fun, animated-style countdown clock or dynamic visual to emphasize the timed or interactive nature of the challenge. The text '[Challenge Theme]' should be bold and attention-grabbing, styled with a fun, contemporary font. Ensure the overall aesthetic feels modern, entertaining, and reflective of the [Brand/Sponsor] brand, appealing to a wide audience and encouraging participation.
        }
      `,
    },
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
    evaluateChallengeEntry: {
      function_tool: {
        type: 'function',
        function: {
          name: 'evaluateChallengeEntry',
          description: `Score a user submission to a challenge prompt based on the scoring type, and provide commentary related directly to the details of their submission.`,
          parameters: {
            type: 'object',
            properties: {
              score: {
                type: 'number',
                description: `The user's score, accurate to two decimal places.`,
              },
              commentary: {
                type: 'string',
                description: `Colorful commentary referencing details of the user's submission. Have fun with this.`,
              },
              transcript: {
                type: 'string',
                description: `The piece of the user's response used to evaluate the given score.`,
              },
            },
            required: ['score', 'commentary'],
          },
        },
      },
      systemInstruction: `Score the user's submission in response to the prompted challenge using the provided scoring instructions, and return a JSON object of the shape { score: number, commentary: string, transcript: string }.
        ## TRANSCRIPT: If you are inferring the user's answer from video analysis or some other media processing, return the subsection of what you identified in their submission that was used to evaluate the given score based on your scoring instructions. It is okay to not return a full transcript of a video, and you don't need to provide timestamps of the video. If there are no words, just describe what you saw.
        ## COMMENTARY: This should be light, brief, and funny text that is a couple of sentences long related to the user's performance. Please make sure it is no more than a short couple of paragraphs, as this will fit on a mobile web screen and space is limited. Have some fun with this!
      `,
      modelHelperInstructions: {
        gemini: [
          `## NOTE FOR COMMENTARY: Try not to repeat yourself multiple times in the same paragraph.`,
          `## NOTE FOR TRANSCRIPT: This is not conversational. This is a data point. The text should either be the given transcript or the inferred final response to the prompt. Again, when creating the transcript snippet from inference analysis, adhere to the provided scoring type absolutely. YOU DO NOT NEED TO return the full transcript of a video, for example.`,
          `## NOTE FOR SCORING: Pay close attention to the prompted challenge. If it asks for the user to pitch or debate something, that is what you should look for in the user submission. If it asks to perform an action, then look for the action being performed. The wording of the prompted challenge is very important.`,
        ],
        gpt: [
          `## NOTE FOR COMMENTARY: Feel free to add a touch more content if you like. It should be less than a paragraph, but doesn't have to be one single quip.`,
        ],
      },
    } as AcmeDefinition,
    getCommentary: {
      function_tool: {
        type: 'function',
        function: {
          name: 'getCommentary',
          description: `
          You're given evaluative responses from a persona of a well-known media personality.
          Your task is to reduce their many responses into one response that will serve as commentary for the whole set.
          Keep the same persona, intonation, and effect as the originals.
        `,
          parameters: {
            type: 'object',
            properties: {
              commentary: {
                type: 'string',
                description: `The commentary reduced from the set of similar input commentaries.`,
              },
            },
            required: ['commentary'],
          },
        },
      },
      systemInstruction: `You're given evaluative responses from a persona of a well-known media personality. Your task is to reduce their many responses into one response that will serve as commentary for the whole set. Keep the same persona, intonation, and effect as the originals. Your response should be a JSON object of the shape { commentary: string }. ## VERY IMPORTANT: It is imperative that you reference VERY SPECIFIC DETAILS THAT ARE NOTED ACROSS THE RESPONSES. These are THE MOST IMPORTANT PARTS.`,
      modelHelperInstructions: {
        gemini: [
          `Try not to repeat yourself multiple times in the same paragraph.`,
          `Do more of referencing specific content pertaining to the user instead of hyping them up. It will help to keep your response brief.`,
        ],
        gpt: [
          `Feel free to add a touch more content if you like. It should be less than a paragraph, but doesn't have to be one single quip.`,
        ],
      },
    },
    getJudgeIntro: {
      function_tool: {
        type: 'function',
        function: {
          name: 'getJudgeIntro',
          description: `You're given a persona of a well-known media personality and your task is to provide a quick introduction as to how difficult a game will be as this person.`,
          parameters: {
            type: 'object',
            properties: {
              easy: {
                type: 'string',
                description: `Your introduction as the person described about an easy game.`,
              },
              medium: {
                type: 'string',
                description: `Your introduction as the person described about a game that requires some skill.`,
              },
              hard: {
                type: 'string',
                description: `Your introduction as the person described about a game that is very hard.`,
              },
            },
            required: ['easy', 'medium', 'hard'],
          },
        },
      },
      systemInstruction: `Your response should be a JSON object of the shape { easy: string, medium: string, hard: string } where the string value
        is one or two sentences long. Keep each response 140 characters or less. Have some fun with this!
      `,
      modelHelperInstructions: {
        gemini: [
          `Try not to repeat yourself multiple times in the same paragraph.`,
          `Be inventive and find novel things to say in the voice of your judge persona.`,
        ],
        gpt: [
          `Feel free to add a touch more content if you like. It should be less than a paragraph, but doesn't have to be one single quip.`,
        ],
      },
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
