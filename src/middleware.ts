import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Match dashboard pages and auth pages, ignore static files, health API, and public images
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/',
    '/((?!api/health|_next/static|_next/image|.*\\.png$).*)',
  ],
};
