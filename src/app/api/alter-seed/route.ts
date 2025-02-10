import { aiModelServiceFactory } from '@/server/services/AiModelServiceFactory';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { seed, llmChoice } = await req.json();

    const aiModelService = aiModelServiceFactory(llmChoice);

    const { text } = await aiModelService.alterSeed(seed);

    console.log('seed:', seed);
    console.log('text:', text);

    return Response.json({ text }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}
