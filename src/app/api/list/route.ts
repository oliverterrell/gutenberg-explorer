import { prisma } from '@/server/clients/prismaClient';
import { RequestHelper } from '@/server/services/RequestHelper';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await RequestHelper.getCurrentUser(req);

    const mostRecent = await prisma.book.findMany({ orderBy: { updatedAt: 'desc' }, take: 10 });
    const mostPopular = await prisma.book.findMany({ orderBy: { timesRequested: 'desc' }, take: 10 });

    let userBooks = await prisma.userBook.findMany({
      where: { userId: user.id },
      orderBy: { count: 'desc' },
      take: 30,
      select: {
        book: true,
      },
    });

    userBooks = userBooks.map((userBook) => userBook.book) as any;

    return Response.json({ mostRecent, mostPopular, userBooks }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Unable to fetch book lists.' }, { status: 500 });
  }
}
