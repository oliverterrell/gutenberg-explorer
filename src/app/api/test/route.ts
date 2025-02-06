import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams;
  const bookId = searchParams.get('bookId');

  try {
    const metadataResponse = await axios.get(`https://gutendex.com/books?ids=${bookId}`);

    const textResponse = await axios.get(`https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`);
    return NextResponse.json(
      { text: textResponse.data, meta: metadataResponse.data.results[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch book content.' }, { status: 500 });
  }
}
