import { AcmeMethodName, AnyCallableMethodEncyclopedia } from '@/shared/AnyCallableMethodEncyclopedia';

export const getAcme = () => {
  return {
    getInstructions: ({ method }: { method: AcmeMethodName }) => {
      let methodDefinition = AnyCallableMethodEncyclopedia[method];

      const instructions = [`---\n${methodDefinition.systemInstruction}`];

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
