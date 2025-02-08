import { prisma } from '@/server/clients/prismaClient';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const {
      payload: { userId },
    } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({ where: { id: userId as string } });

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, preference } = await req.json();

    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { preference } });

    return Response.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err }, { status: 500 });
  }
}
