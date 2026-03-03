import NextAuth from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    tenantSlug: string | null;
    setupCompleted: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      tenantId: string;
      tenantSlug: string | null;
      setupCompleted: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    tenantSlug: string | null;
    setupCompleted: boolean;
  }
}
