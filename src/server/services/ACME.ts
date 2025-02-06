import { MediaArgs } from '@/server/types';
import { AcmeMethodName, AnyCallableMethodEncyclopedia } from '@/shared/AnyCallableMethodEncyclopedia';

export const getAcme = () => {
  return {
    getInstructions: ({ method, mediaArgs }: { method: AcmeMethodName; mediaArgs?: MediaArgs }) => {
      let methodDefinition = AnyCallableMethodEncyclopedia[method];

      const instructions = [`---\n${methodDefinition.systemInstruction}`];

      if (mediaArgs) {
        instructions.push(
          `---\n# IMPORTANT: It is IMPERATIVE that you ANALYZE and COMMENT on VERY SPECIFIC DETAILS THAT ARE NOTICED IN THE MULTIMEDIA RESPONSES. THESE THE MOST IMPORTANT PARTS.`
        );
      }

      if (mediaArgs || methodDefinition?.modelHelperInstructions?.gemini) {
        if (methodDefinition?.modelHelperInstructions?.gemini) {
          instructions.push(
            `---\n## Additional Instructions: ${methodDefinition.modelHelperInstructions.gemini.join(' ')}`
          );
        }
      }

      instructions.push(
        `---\n# Stringified function definition for you to use: ${JSON.stringify(methodDefinition.function_tool)}`
      );

      return instructions.map((text) => ({ text }));
    },
    ...AnyCallableMethodEncyclopedia,
  };
};
export const ACME = getAcme();
export type ACME = ReturnType<typeof getAcme>;
