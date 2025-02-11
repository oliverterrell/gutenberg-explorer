import { RequestHelper } from '@/server/services/RequestHelper';
import axios from 'axios';
import { SymantoService } from '@/server/services/SymantoService';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const aiModelService = await RequestHelper.getAiModelService(req);

    const { book } = await req.json();

    const plainTextResponse = await axios.get(book.plainTextUrl);
    const bookText = plainTextResponse.data;

    const symantoService = new SymantoService();
    const big5 = await symantoService.getBig5(bookText);

    if (big5.error) {
      return Response.json({ error: 'Error reading Big 5' }, { status: 200 });
    }

    // 350,000 chars = ~100,000 tokens. Just under OpenAI's limit of 128,000 tokens (most restrictive), hedged for safety.
    const MAX_CHARS = 350000;
    const trimmedText = bookText.slice(0, MAX_CHARS);

    const { summary } = await aiModelService.getBig5Summary(trimmedText, big5 as Record<string, number>);

    return Response.json({ big5, summary }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: 'Server Error' }, { status: 500 });
  }
}
