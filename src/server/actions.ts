'use server';

import { cookies } from 'next/headers';

export async function storeSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set('otAuthToken', token);
}

export async function deleteSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete('otAuthToken');
}
