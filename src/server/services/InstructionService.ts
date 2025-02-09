import { Big5Aspect } from '@/shared';

export const InstructionService = {
  getChallengeDescription: ({ prompt }) => {
    return `---\n# CHALLENGE: ${prompt.text}`;
  },

  getUserSubmission: (args: { userSubmission: any }): string => {
    const { userSubmission } = args;
    return `---\n# USER SUBMISSION: {{ ${userSubmission.text ?? '...'} }}`;
  },

  getJudgeRoleGuidelines: ({ game, aiJudgeArgs }) => {
    let roleGuidelines = '';

    if (aiJudgeArgs.trait === 'Trait.Accuracy') {
      roleGuidelines += `## Goal: Judge the participant’s submission based on accuracy for any given challenge category (e.g., dog breeds, movie titles, famous landmarks, etc.).
Provide feedback that includes the number of correct answers and examples of more unique or standout correct answers that the participant is likely most proud of.
        ## Scoring Criteria:
Evaluate the submission based on the number of correct answers within the challenge’s category.
        ## Commentary:
In your feedback, state the total number of correct answers and provide 2-5 examples of answers that were more unique or notable. These should be examples that the participant would likely feel most proud of answering, particularly those that stand out compared to more common responses.
        ### Quantifying Correct Answers:
After scoring, mention the exact number of correct answers the participant provided.
        ### Highlighting Unique/Notable Examples:
Include 2-5 examples of the most unique or impressive correct answers in the feedback, selecting those that are less common or likely to stand out, naming them explicitly in your commentary. ONLY INCLUDE ITEMS THAT WERE PRESENT IN THE USER SUBMISSION. PICK THINGS from the VIDEO to highlight in your commentary.`;
    } else if (aiJudgeArgs.aiJudge.name === 'Snoop Dogg' && game.slug === 'wag-name-those-dog-breeds') {
      roleGuidelines += `## Your Objective:\nAfter analyzing the video submission, judge the participant based on their speed (how quickly they named the breeds) and focus (how engaged they were during the task). Speed is determined by the participant’s pace, while focus is assessed by how well they maintained attention on the camera to avoid cheating—like reading from another screen. If it seems obvious that the participant is reading or looking off-screen too much, you can offer playful teasing, such as asking if they’re reading dog breeds off a list or sending them to the principal’s office for some detention. Brief glances off-screen are okay, but you can remind them to keep their eyes on the camera.`;
    }

    return roleGuidelines === ''
      ? ''
      : `---\n# Guidelines for your Role: ${aiJudgeArgs.trait}\n${roleGuidelines}`;
  },

  getJudgePersonaInstructions: ({
    aiJudgeArgs,
    scoringConfig,
  }: {
    aiJudgeArgs: any;
    scoringConfig?: any;
  }): string => {
    const { trait, aiJudge, difficulty, userName } = aiJudgeArgs;

    const difficultyMap = {
      0: {
        type: 'Easy',
        instruction: `---\nYou're generally easygoing, and while less tough than medium or hard judging you will give low scores when warranted. You break tough news gently. You always find something nice and supportive to say in commentary, even when the score is low.`,
      },
      1: {
        type: 'Medium',
        instruction: `---\nYou're not a pushover, but not impossible to make happy. Score fairly across the range of possible scores. You balance constructive feedback with positive encouragement. You are supportive in commentary.`,
      },
      2: {
        type: 'Hard',
        instruction: `---\nYou're kind of tough to impress. A participant really has to go above and beyond to get a high score from you. You balance constructive feedback with positive encouragement. You are supportive in commentary.`,
      },
    };

    const traitWordMap = {
      [Big5Aspect.OPENNESS]: {
        adjective: `funny`,
      },
      [Big5Aspect.CONSCIENTIOUSNESS]: {
        adjective: `logical`,
      },
      [Big5Aspect.EXTRAVERSION]: {
        adjective: `creative`,
      },
      [Big5Aspect.AGREEABLENESS]: {
        adjective: 'precise',
      },
      [Big5Aspect.NEUROTICISM]: {
        adjective: 'unique',
      },
    };

    const _getTraitInstructions = (scoringType: any) => {
      if (!trait) {
        return '';
      }

      const defaultTraitInstructions = `---\nYour scoring and commentary should be through the lens of ${trait}.`;

      if (traitWordMap[trait]) {
        switch (scoringType) {
          case 'ScoringType.ModelEval':
            return `
          ---\nYour scoring and commentary should be through the lens of ${trait}.
            Score based on how ${traitWordMap[trait].adjective} the submission was and provide commentary about the specific details
            that made it ${traitWordMap[trait].adjective} to you. If the submission does not attempt the prompted challenge, award zero
            points and make note of how there was no genuine attempt in your commentary.`;
          default:
            return defaultTraitInstructions;
        }
      }

      return defaultTraitInstructions;
    };

    const _getDifficultyInstructions = () => {
      if (typeof difficulty === 'undefined') {
        return '';
      }

      return `---\nOn a scale of "easy", "medium", or "hard", please embody a difficulty of ${difficultyMap[difficulty ?? 0].type} for scoring and commentary. ${difficultyMap[difficulty ?? 0].instruction} VERY IMPORTANT - COMMENT ON DETAILS YOU NOTICE IN THEIR SUBMISSION. Speak to ${userName ?? 'the user'} directly as if you are there in person with them.`;
    };

    return `---\n# YOUR JUDGE PERSONA: ${aiJudge.seed} You are judging a reality competition where users participate in challenges to win a prize. ${_getTraitInstructions(scoringConfig?.operator)} ${_getDifficultyInstructions()}`;
  },

  getScoringInstructions: ({ scoringConfig }: { scoringConfig: any }): string => {
    const {
      operator,
      points: { correct: maxPoints },
    } = scoringConfig;

    const map = {
      ['ScoringType.Exactish']: `The user has to get the right answer, but be a little lenient when it comes to typos, casing, or different ways to call the same thing. Use your best judgment to determine if their answer is in good faith an honest guess for the correct answer, even if the actual content deviates from what is listed as expected, so long as they really do mean the same thing. Award no points if their guess is incorrect. ## IMPORTANT NOTE: If the user's answer is three periods in a row (i.e. '...'), award zero points and return a transcript of '...' to signify a mute response. ## IMPORTANT NOTE: This is a binary ${maxPoints} points or 0. Be sure to award one those two. Other scores are considered to be invalid.`,
      ['ScoringType.LTE']: `THE USER WILL GET 0 POINTS IF: 1. They did not provide an answer, 2. their answer is under 1/2 of the correct amount, 3. their answer is three periods in a row (i.e. '...'), or 4. their guess is even slightly greater than the correct answer. THE USER WILL GET ${maxPoints * 0.5} POINTS IF: Their answer is at least 3/4 of the correct answer amount. THE USER WILL GET ${maxPoints * 0.75} POINTS IF: Their answer is at least 4/5 of the correct answer amount. THE USER WILL GET ${maxPoints * 0.95} POINTS IF: Their answer is pretty close to the actual correct answer amount. THE USER WILL GET ${maxPoints} POINTS IF: Their answer matches the correct answer amount exactly, to a high level of precision.`,
      ['ScoringType.Binary']: `The user's has to match exactly with the provided correct answer. No "almost". The maximum points you can award is ${maxPoints}. Return either 0 or ${maxPoints}`,
      ['ScoringType.ModelEval']: `Use your best judgment based on the provided instructions. Judge based on the prompted challenge absolutely and unequivocally. Analyze the participant's submission thoughtfully, and evaluate a final score that is appropriate. The maximum points you can award is ${maxPoints} and the minimum is 0. Return a score between 0 and ${maxPoints} accurate to two decimal places, judging how well the participant's submission accomplished the challenge. ## Note: IF THE USER DOES NOT MAKE A GENUINE ATTEMPT IN RESPONSE TO THE PROMPTED CHALLENGE then award 0 points and explain that they need to make a sincere effort in your commentary.`,
    };

    return `---\n# HOW TO SCORE (type=\`${operator}\`): ${map[operator]}`;
  },
};
