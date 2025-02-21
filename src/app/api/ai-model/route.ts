import { prisma } from '@/server/clients/prismaClient';

export async function GET() {
  try {
    const aiModels = await prisma.aiModel.findMany();
    return Response.json({ aiModels }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: error }, { status: 500 });
  }
}
