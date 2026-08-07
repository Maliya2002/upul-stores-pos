import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { UserRole } from "@/types/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.isActive) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            image: user.avatar ?? null,
            isActive: user.isActive,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as unknown as {
          id: string;
          role: UserRole;
          isActive: boolean;
        };
        token.id = customUser.id ?? "";
        token.role = customUser.role;
        token.isActive = customUser.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const customSession = session.user as unknown as {
          id: string;
          role: UserRole;
          isActive: boolean;
        };
        customSession.id = token.id as string;
        customSession.role = token.role as UserRole;
        customSession.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
});