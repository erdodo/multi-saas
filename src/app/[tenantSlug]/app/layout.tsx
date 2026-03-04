import { Bell, PanelLeftClose } from "lucide-react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ProfileMenu } from "@/components/profile-menu";
import { NavLinks } from "@/components/app/NavLinks";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const FONT_STACK: Record<string, string> = {
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  roboto: "'Roboto', sans-serif",
  system: "system-ui, sans-serif",
};

const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const t = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { name: true, siteTitle: true, faviconUrl: true },
  });
  if (!t) return {};
  return {
    title: t.siteTitle ?? t.name,
    icons: t.faviconUrl ? { icon: t.faviconUrl } : undefined,
  };
}

export default async function TenantAppLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;

  // Slug üzerinden tenant ve branding verisini çek
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      siteTitle: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      textOnPrimary: true,
      fontFamily: true,
      borderRadius: true,
      darkMode: true,
      tenantModules: {
        where: { isActive: true },
        include: { module: { select: { key: true, name: true } } },
      },
    },
  });

  if (!tenant) return notFound();

  // Middleware slug doğruluğunu zaten garanti ediyor.
  // ID mismatch yeniden yönlendirme sonsuz döngüye neden olduğundan kaldırıldı.

  if (!session.user.setupCompleted) redirect("/setup");

  const primaryColor = tenant.primaryColor ?? "#3b82f6";
  const secondaryColor = tenant.secondaryColor ?? "#6366f1";
  const accentColor = tenant.accentColor ?? "#10b981";
  const textOnPrimary = tenant.textOnPrimary ?? "#ffffff";
  const fontFamily = FONT_STACK[tenant.fontFamily ?? "inter"];
  const borderRadius = RADIUS_MAP[tenant.borderRadius ?? "md"];

  const cssVars: React.CSSProperties = {
    "--brand-primary": primaryColor,
    "--brand-secondary": secondaryColor,
    "--brand-accent": accentColor,
    "--brand-text-on-primary": textOnPrimary,
    "--brand-font": fontFamily,
    "--brand-radius": borderRadius,
  } as React.CSSProperties;

  return (
    <div
      className={`min-h-screen flex ${tenant.darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}
      style={{ ...cssVars, fontFamily }}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col dark:bg-slate-800 dark:border-slate-700">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="h-8 max-w-35 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor, color: textOnPrimary }}
              >
                {tenant.name[0]?.toUpperCase()}
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white truncate">
                {tenant.siteTitle ?? tenant.name}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLinks
            tenantSlug={tenantSlug}
            modules={tenant.tenantModules.map((tm) => ({
              key: tm.module.key,
              name: tm.module.name,
            }))}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
          <ProfileMenu
            name={session.user.name ?? "Kullanıcı"}
            email={session.user.email ?? ""}
            role={session.user.role ?? ""}
            tenantSlug={tenantSlug}
            primaryColor={primaryColor}
            modules={tenant.tenantModules.map((tm) => ({
              key: tm.module.key,
              name: tm.module.name,
            }))}
          />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
