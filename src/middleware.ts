import { NextRequest, NextResponse, NextMiddleware } from 'next/server';
import { jwtVerify } from 'jose';

export const middleware: NextMiddleware = async (req: NextRequest) => {
  const token = req.cookies.get('otAuthToken');
  const guestToken = req.cookies.get('otGuestToken');

  if (!token && !guestToken) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  try {
    if (token) {
      await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));
    } else if (guestToken) {
      await jwtVerify(guestToken.value, new TextEncoder().encode(process.env.GUEST_JWT_SECRET));
    }

    return NextResponse.next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Middleware error: ${error.message}`);
    }
    return NextResponse.redirect(new URL('/auth', req.url));
  }
};

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|fonts|favicon.ico|api/login|api/register|api/guest).*)'],
};
