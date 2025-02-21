import { prisma } from '@/server/clients/prismaClient';
import { RequestHelper } from '@/server/services/RequestHelper';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await RequestHelper.getCurrentUser(req);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 500 });
    }

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await RequestHelper.getCurrentUser(req);

    if (!user.email) {
      return Response.json({ user }, { status: 201 });
    }

    const { preference } = await req.json();

    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { preference } });

    return Response.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err }, { status: 500 });
  }
}
