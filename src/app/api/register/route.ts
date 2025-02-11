import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';
import { prisma } from '@/server/clients/prismaClient';

export async function POST(req: NextRequest) {
  try {
    const newUserData = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email: newUserData.email } });

    if (existingUser?.id) {
      return Response.json({ message: `Email already in use.` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(newUserData.password, 8);
    const newlyCreatedUser = await prisma.user.create({ data: { ...newUserData, password: hashedPassword } });

    return Response.json({ newUser: newlyCreatedUser }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error creating new user.' }, { status: 500 });
  }
}
