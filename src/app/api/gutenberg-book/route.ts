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

    const [eBookUrl, coverArtUrl] = await Promise.all([
      BookService.downloadToS3(eBookDownloadUrl, gutenbergId, S3ActionType.eBook),
      BookService.downloadToS3(coverArtDownloadUrl, gutenbergId, S3ActionType.CoverArt),
    ]);

    const book = await prisma.book.create({
      data: {
        title,
        gutenbergId,
        eBookUrl,
        coverArtUrl,
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
    return NextResponse.json({ error: 'Failed to fetch book content.' }, { status: 500 });
  }
}
