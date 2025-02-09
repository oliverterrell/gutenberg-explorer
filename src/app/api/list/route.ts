import { prisma } from '@/server/clients/prismaClient';

export async function GET() {
  try {
    const mostRecent = await prisma.book.findMany({ orderBy: { updatedAt: 'desc' }, take: 10 });
    const mostPopular = await prisma.book.findMany({ orderBy: { timesRequested: 'desc' }, take: 10 });

    return Response.json({ mostRecent, mostPopular }, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Unable to fetch book lists.' }, { status: 500 });
  }
}
