import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Bell, CalendarDays, ArrowLeft } from "lucide-react";
import { RandevuSidebarNav } from "@/modules/randevu/components/layout/SidebarNav";
import { ProfileMenu } from "@/components/profile-menu";
import {
  getTenantBranding,
  brandCssVars,
  darken,
  hexToRgba,
} from "@/lib/branding";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const b = await getTenantBranding(tenantSlug);
  return {
    title:
      b.siteTitle ?? (b.name ? `${b.name} | Randevu Paneli` : "Randevu Paneli"),
    icons: {
      icon: b.faviconUrl ?? b.logoUrl ?? undefined,
      apple: b.logoUrl ?? undefined,
    },
  };
}

export default async function RandevuDashboardLayout({
  children,
  params,
}: Props) {
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
  const modules = tenantModules.map((tm) => ({
    key: tm.module.key,
    name: tm.module.name,
  }));

  // Sidebar derived from branding primary color
  const sidebarBg = darken(b.primaryColor, 0.18);
  const sidebarBg2 = darken(b.primaryColor, 0.28);
  const sidebarGrad = `linear-gradient(180deg, ${sidebarBg} 0%, ${sidebarBg2} 100%)`;

  return (
    <div className="h-screen overflow-hidden flex" style={brandCssVars(b)}>
      {/* Sidebar */}
      <aside
        className="w-64 hidden md:flex flex-col h-full"
        style={{ background: sidebarGrad }}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center px-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${hexToRgba("#ffffff", 0.1)}` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {b.logoUrl ? (
              <img
                src={b.logoUrl}
                alt={b.name}
                width={36}
                height={36}
                // eslint-disable-next-line @next/next/no-img-element
                className="object-cover flex-shrink-0"
                style={{ borderRadius: b.radiusPx }}
              />
            ) : (
              <div
                className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: hexToRgba("#ffffff", 0.2),
                  borderRadius: b.radiusPx,
                }}
              >
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-sm text-white truncate block leading-tight">
                {b.name}
              </span>
              <p
                className="text-xs leading-none"
                style={{ color: hexToRgba("#ffffff", 0.5) }}
              >
                Randevu Paneli
              </p>
            </div>
          </div>
        </div>

        <RandevuSidebarNav
          tenantSlug={tenantSlug}
          primaryColor={b.primaryColor}
          textOnPrimary={b.textOnPrimary}
        />

        {/* Back to apps */}
        <div className="px-3 pb-2">
          <Link
            href={`/${tenantSlug}/app`}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all text-white/45 hover:text-white hover:bg-white/10"
            style={{ borderRadius: b.radiusPx }}
          >
            <ArrowLeft className="w-4 h-4" />
            Uygulamalara Dön
          </Link>
        </div>

        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${hexToRgba("#ffffff", 0.1)}` }}
        >
          <ProfileMenu
            name={name ?? "Kullanıcı"}
            email={email ?? ""}
            role={role ?? ""}
            tenantSlug={tenantSlug}
            primaryColor={b.primaryColor}
            modules={modules}
          />
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ background: b.primaryColor, borderRadius: b.radiusPx }}
            >
              <CalendarDays
                className="w-4 h-4 text-white"
                style={{ color: b.textOnPrimary }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {b.name}{" "}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-sm text-slate-400">Randevu</span>
          </div>
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
