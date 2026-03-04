import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { tenant: true },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        if (!user.tenant) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug ?? null,
          setupCompleted: user.tenant.setupCompleted,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // İlk girişte kullanıcı bilgilerini token'a ekle
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.setupCompleted = (user as any).setupCompleted;
      }
      // setup tamamlandığında client'tan update() çağrısıyla session yenilenir
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
  // Reverse proxy (Nginx/Cloudflare) arkasında HTTPS ile çalışmak için zorunlu.
  // Olmadığında /api/auth/session 500 döndürür.
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
