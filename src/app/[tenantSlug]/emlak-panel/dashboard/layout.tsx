import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Bell, Home } from "lucide-react";
import { EmlakSidebarNav } from "@/modules/emlak/components/layout/SidebarNav";
import { ProfileMenu } from "@/components/profile-menu";
import { getTenantBranding, contrastText } from "@/modules/emlak/lib/branding";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const b = await getTenantBranding(tenantSlug);
  return {
    title: b.siteTitle ?? (b.name ? `${b.name} | Emlak Paneli` : "Emlak Paneli"),
    icons: {
      icon:  b.faviconUrl ?? b.logoUrl ?? undefined,
      apple: b.logoUrl ?? undefined,
    },
  };
}

export default async function EmlakDashboardLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.setupCompleted) redirect("/setup");

  const { tenantSlug } = await params;
  const { name, email, role } = session.user;

  const [b, tenantModules] = await Promise.all([
    getTenantBranding(tenantSlug),
    prisma.tenantModule.findMany({
      where: { tenant: { slug: tenantSlug }, isActive: true },
      include: { module: { select: { key: true, name: true } } },
    }),
  ]);
  const modules = tenantModules.map((tm) => ({ key: tm.module.key, name: tm.module.name }));

  const primaryColor  = b.primaryColor  ?? "#3b82f6";
  const textOnPrimary = b.textOnPrimary ?? contrastText(primaryColor);

  const RADIUS_MAP: Record<string, string> = {
    none: "0px", sm: "4px", md: "8px", lg: "12px", full: "9999px",
  };
  const FONT_MAP: Record<string, string> = {
    inter:   "'Inter', system-ui, sans-serif",
    poppins: "'Poppins', system-ui, sans-serif",
    roboto:  "'Roboto', system-ui, sans-serif",
    system:  "system-ui, sans-serif",
  };
  const brandRadius = RADIUS_MAP[b.borderRadius ?? "md"] ?? "8px";
  const brandFont   = FONT_MAP[b.fontFamily   ?? "inter"] ?? "system-ui, sans-serif";

  return (
    <div
      className="h-screen overflow-hidden bg-slate-50 flex"
      style={{
        "--brand-primary":   primaryColor,
        "--brand-text":      textOnPrimary,
        "--brand-secondary": b.secondaryColor ?? "#6366f1",
        "--brand-accent":    b.accentColor    ?? "#10b981",
        "--brand-radius":    brandRadius,
        "--brand-font":      brandFont,
        fontFamily:          brandFont,
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {b.logoUrl ? (
              <img
                src={b.logoUrl}
                alt={b.name}
                width={32}
                height={32}
                className="rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: primaryColor, color: textOnPrimary }}
              >
                <Home className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-base tracking-tight text-slate-900 truncate block leading-tight">
                {b.name ?? "Emlak"}
              </span>
              <p className="text-xs text-slate-400 leading-none">Emlak Paneli</p>
            </div>
          </div>
        </div>

        <EmlakSidebarNav
          tenantSlug={tenantSlug}
          primaryColor={primaryColor}
          textOnPrimary={textOnPrimary}
        />

        <ProfileMenu
          name={name ?? "Kullanıcı"}
          email={email ?? ""}
          role={role ?? ""}
          tenantSlug={tenantSlug}
          primaryColor={primaryColor}
          modules={modules}
        />
      </aside>

      {/* Sağ taraf */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <span className="text-sm text-slate-500 font-medium">
            {b.name ?? tenantSlug} · Emlak
          </span>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
