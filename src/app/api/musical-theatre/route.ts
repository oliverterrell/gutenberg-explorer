import { RequestHelper } from '@/server/services/RequestHelper';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { book } = await req.json();
    const aiModelService = await RequestHelper.getAiModelService(req);

    const { genre, celebrityRoles, summary } = await aiModelService.getMusicalTheatre(book);

    return Response.json({ genre, celebrityRoles, summary }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}
