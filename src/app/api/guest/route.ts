import { serialize } from 'cookie';
import { SignJWT } from 'jose';

export async function POST() {
  try {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 60 * 60 * 24 * 14;

    const guestToken = await new SignJWT({
      role: 'guest',
      guestId: `guest_${Date.now()}`,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(expiresAt)
      .setIssuedAt(issuedAt)
      .setNotBefore(issuedAt)
      .sign(new TextEncoder().encode(process.env.GUEST_JWT_SECRET));

    const serializedGuestTokenSessionCookie = serialize('otGuestToken', guestToken, {
      httpOnly: false,
      secure: true,
      path: '/',
    });

    const headers = new Headers();
    headers.append('Set-Cookie', serializedGuestTokenSessionCookie);

    return Response.json({ message: 'Guest access granted' }, { status: 200, headers });
  } catch (error) {
    console.error('Error creating guest token:', error);
    return Response.json({ message: 'Error creating guest access' }, { status: 500 });
  }
}
