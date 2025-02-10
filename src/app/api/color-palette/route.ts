import { RequestHelper } from '@/server/services/RequestHelper';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { book } = await req.json();
    const aiModelService = await RequestHelper.getAiModelService(req);

    const { colorPalette, summary } = await aiModelService.getColorPalette(book);

    return Response.json({ colorPalette, summary }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}
