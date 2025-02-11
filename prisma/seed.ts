import { prisma } from '@/server/clients/prismaClient';
import { Prisma } from '@prisma/client';

const aiModels: Prisma.AiModelCreateInput[] = [
  {
    model: 'gemini-1.5-flash',
    name: 'Gemini',
    provider: 'Google',
    class: 'llm',
  },
  {
    model: 'gpt-4o',
    name: 'ChatGPT',
    provider: 'Open AI',
    class: 'llm',
  },
  {
    model: 'claude-3-5-sonnet-20241022',
    name: 'Claude',
    provider: 'Anthropic',
    class: 'llm',
  },
];

async function seed() {
  console.log('seed start');
  await Promise.all(
    aiModels.map((aiModel) => {
      return prisma.aiModel.upsert({
        where: { model: aiModel.model },
        create: aiModel,
        update: aiModel,
      });
    })
  );
  console.log('seed finished');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
