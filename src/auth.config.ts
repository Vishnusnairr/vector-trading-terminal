import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup' || nextUrl.pathname === '/')) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.paperBalance = (user as any).paperBalance;
      }
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.paperBalance = session.paperBalance ?? token.paperBalance;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).paperBalance = token.paperBalance as number;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts since Credentials requires bcrypt (non-edge compatible)
} satisfies NextAuthConfig;
