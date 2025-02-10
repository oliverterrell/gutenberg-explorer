import { RequestHelper } from '@/server/services/RequestHelper';
import { UtilActionType } from '@/shared';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { seed, book, action } = await req.json();

    const aiModelService = await RequestHelper.getAiModelService(req);

    switch (action) {
      case UtilActionType.ALTER_SEED:
        const { text } = await aiModelService.alterSeed(seed);
        return Response.json({ text }, { status: 200 });
      case UtilActionType.PARSE_AUTHOR:
        const { author } = await aiModelService.parseAuthor(book);
        return Response.json({ author }, { status: 200 });
      default:
        return Response.json({ message: 'No action selected' }, { status: 200 });
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}
