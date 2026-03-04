import { Bell, PanelLeftClose } from "lucide-react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { ProfileMenu } from "@/components/profile-menu";
import { NavLinks } from "@/components/app/NavLinks";
import { prisma } from "@/lib/prisma";
import {
  getTenantBranding,
  brandCssVars,
  darken,
  hexToRgba,
} from "@/lib/branding";
import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const b = await getTenantBranding(tenantSlug);
  return {
    title: b.siteTitle ?? b.name,
    icons: b.faviconUrl ? { icon: b.faviconUrl } : undefined,
  };
}

export default async function TenantAppLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;

  const [b, tenantModulesData] = await Promise.all([
    getTenantBranding(tenantSlug),
    prisma.tenantModule.findMany({
      where: { tenant: { slug: tenantSlug }, isActive: true },
      include: { module: { select: { key: true, name: true } } },
    }),
  ]);

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) return notFound();

  if (!session.user.setupCompleted) redirect("/setup");

  const modules = tenantModulesData.map((tm) => ({
    key: tm.module.key,
    name: tm.module.name,
  }));

  // Sidebar: dark version of primary color
  const sidebarBg = darken(b.primaryColor, 0.18);
  const sidebarBg2 = darken(b.primaryColor, 0.28);
  const sidebarGrad = `linear-gradient(180deg, ${sidebarBg} 0%, ${sidebarBg2} 100%)`;

  return (
    <div
      className={`min-h-screen flex ${b.darkMode ? "dark" : ""}`}
      style={brandCssVars(b)}
    >
      {/* Sidebar */}
      <aside
        className="w-64 hidden md:flex flex-col"
        style={{ background: sidebarGrad }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${hexToRgba("#ffffff", 0.1)}` }}
        >
          {b.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.logoUrl}
              alt={b.name}
              className="h-8 max-w-[140px] object-contain"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: hexToRgba("#ffffff", 0.2),
                  borderRadius: b.radiusPx,
                  color: b.textOnPrimary,
                }}
              >
                {b.name[0]?.toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-sm text-white truncate block leading-tight">
                  {b.siteTitle ?? b.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: hexToRgba("#ffffff", 0.5) }}
                >
                  Dashboard
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <NavLinks tenantSlug={tenantSlug} modules={modules} />
        </nav>

        {/* Profile */}
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${hexToRgba("#ffffff", 0.1)}` }}
        >
          <ProfileMenu
            name={session.user.name ?? "Kullanıcı"}
            email={session.user.email ?? ""}
            role={session.user.role ?? ""}
            tenantSlug={tenantSlug}
            primaryColor={b.primaryColor}
            modules={modules}
          />
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${b.darkMode ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <header
          className={`h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm flex-shrink-0 ${b.darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} border-b`}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 -ml-2 rounded-lg transition-colors"
              style={{ color: b.darkMode ? "#94a3b8" : "#64748b" }}
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <span
              className={`text-sm font-medium ${b.darkMode ? "text-slate-400" : "text-slate-500"} hidden sm:block`}
            >
              {b.siteTitle ?? b.name}
            </span>
          </div>
          <button
            className={`p-2 rounded-lg transition-colors ${b.darkMode ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Bell className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
