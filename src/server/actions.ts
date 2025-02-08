'use server';

import { ZUser } from '@/shared/zPrismaTypes';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './clients/prismaClient';

export async function storeSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('otAuthToken', token);
  return new Response(null, { status: 200 });
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('otAuthToken');
  return new Response(null, { status: 200 });
}
