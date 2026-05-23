import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { userRepo } from '@/services/user-repo';
import { z } from 'zod';

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await userRepo.findByEmail(email);
        if (!user) return null;

        const passwordsMatch = await userRepo.verifyPassword(user, password);
        if (passwordsMatch) {
          // Log login time
          await userRepo.touchLastLogin(user.id);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            paperBalance: user.paperBalance,
          };
        }

        return null;
      },
    }),
  ],
});
