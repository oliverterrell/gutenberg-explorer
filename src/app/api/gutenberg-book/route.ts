import { prisma } from '@/server/clients/prismaClient';
import { BookService } from '@/server/services/BookService';
import { S3ActionType } from '@/shared';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  const searchParams = req.nextUrl.searchParams;
  const gutenbergIdParam = searchParams.get('gutenbergId');
  const gutenbergId = parseInt(gutenbergIdParam);

  try {
    const existingBook = await prisma.book.findUnique({ where: { gutenbergId } });

    if (existingBook) {
      await prisma.book.update({ where: { gutenbergId }, data: { timesRequested: { increment: 1 } } });
      return Response.json({ book: existingBook }, { status: 200 });
    }

    const metadataResponse = await axios.get(`https://gutendex.com/books?ids=${gutenbergId}`);
    const meta = metadataResponse.data.results[0];

    const title = meta.title;
    const authors = meta.authors.map((author: any) => author.name);
    const translators = meta.translators.map((translator: any) => translator.name);
    const subjects = meta.subjects;
    const bookshelves = meta.bookshelves;
    const languages = meta.languages;
    const copyright = meta.copyright;
    const summaries = meta.summaries;

    const eBookDownloadUrl = meta.formats['application/epub+zip'];
    const coverArtDownloadUrl = meta.formats['image/jpeg'];
    const plainTextDownloadUrl =
      meta.formats['text/plain; charset=utf-8'] || meta.formats['text/plain; charset=us-ascii'];

    const [eBookUrl, coverArtUrl, plainTextUrl] = await Promise.all([
      BookService.downloadToS3(eBookDownloadUrl, gutenbergId, S3ActionType.E_BOOK),
      BookService.downloadToS3(coverArtDownloadUrl, gutenbergId, S3ActionType.COVER_ART),
      BookService.downloadToS3(plainTextDownloadUrl, gutenbergId, S3ActionType.PLAIN_TEXT),
    ]);

    const book = await prisma.book.create({
      data: {
        title,
        gutenbergId,
        eBookUrl,
        coverArtUrl,
        plainTextUrl,
        authors,
        translators,
        subjects,
        bookshelves,
        languages,
        copyright,
        summaries,
      },
    });

    return NextResponse.json({ book }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch book content.' }, { status: 500 });
  }
}
