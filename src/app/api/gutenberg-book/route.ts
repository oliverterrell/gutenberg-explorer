import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams;
  const gutenbergId = searchParams.get('gutenbergId');

  try {
    const metadataResponse = await axios.get(`https://gutendex.com/books?ids=${gutenbergId}`);

    const formats = metadataResponse.data.results[0].formats;
    const htmlUrl = formats['text/html; charset=utf-8'] || formats['text/html'];

    const htmlResponse = await axios.get(htmlUrl);

    return NextResponse.json(
      { html: htmlResponse.data, meta: metadataResponse.data.results[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch book content.' }, { status: 500 });
  }
}
