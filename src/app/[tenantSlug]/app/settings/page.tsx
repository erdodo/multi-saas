import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.tenantId || !session.user.id) redirect("/login");

  const [tenant, user] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        name:           true,
        slug:           true,
        siteTitle:      true,
        logoUrl:        true,
        faviconUrl:     true,
        primaryColor:   true,
        secondaryColor: true,
        accentColor:    true,
        textOnPrimary:  true,
        fontFamily:     true,
        borderRadius:   true,
        darkMode:       true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
  ]);

  if (!tenant || !user) redirect("/login");

  return (
    <SettingsClient
      tenant={{
        name:           tenant.name,
        slug:           tenant.slug,
        siteTitle:      tenant.siteTitle,
        logoUrl:        tenant.logoUrl,
        faviconUrl:     tenant.faviconUrl,
        primaryColor:   tenant.primaryColor   ?? "#3b82f6",
        secondaryColor: tenant.secondaryColor ?? "#6366f1",
        accentColor:    tenant.accentColor    ?? "#10b981",
        textOnPrimary:  tenant.textOnPrimary  ?? "#ffffff",
        fontFamily:     tenant.fontFamily     ?? "inter",
        borderRadius:   tenant.borderRadius   ?? "md",
        darkMode:       tenant.darkMode       ?? false,
      }}
      user={{ name: user.name, email: user.email }}
    />
  );
}
