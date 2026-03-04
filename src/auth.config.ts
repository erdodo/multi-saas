// Edge Runtime ile uyumlu minimal auth config.
// Bu dosyada Prisma, bcrypt veya Node.js-only modül OLMAMALI.
// middleware.ts bu dosyayı kullanır.
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],  // Credentials provider (Prisma gerektirir) auth.ts'de eklenir
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.setupCompleted = (user as any).setupCompleted;
      }
      if (trigger === "update" && session) {
        if (session.setupCompleted !== undefined) {
          token.setupCompleted = session.setupCompleted;
        }
        if (session.tenantSlug !== undefined) {
          token.tenantSlug = session.tenantSlug;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.tenantId = token.tenantId as string;
      session.user.tenantSlug = (token.tenantSlug as string) ?? null;
      session.user.setupCompleted = token.setupCompleted as boolean;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
};
