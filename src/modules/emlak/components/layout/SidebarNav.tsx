"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  FileText,
  CreditCard,
  Zap,
  FolderOpen,
  Settings,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: "", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { path: "/properties", label: "Mülklerim", icon: Building2, exact: false },
  { path: "/owners", label: "Mülk Sahipleri", icon: UserRound, exact: false },
  { path: "/tenants", label: "Kiracılar", icon: Users, exact: false },
  { path: "/leases", label: "Kira Sözleşmeleri", icon: FileText, exact: false },
  { path: "/payments", label: "Ödemeler", icon: CreditCard, exact: false },
  { path: "/subscriptions", label: "Abonelikler", icon: Zap, exact: false },
  { path: "/documents", label: "Belgeler", icon: FolderOpen, exact: false },
];

interface Props {
  tenantSlug: string;
  primaryColor: string;
  textOnPrimary: string;
}

// Props kept for API compat but styling uses CSS vars only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmlakSidebarNav({
  tenantSlug,
  primaryColor,
  textOnPrimary,
}: Props) {
  const pathname = usePathname();
  const base = `/${tenantSlug}/emlak-panel/dashboard`;

  const isActive = (path: string, exact?: boolean) => {
    const href = `${base}${path}`;
    return exact
      ? pathname === href
      : pathname.startsWith(href) && (path !== "" || pathname === href);
  };

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 font-medium text-sm transition-all duration-200 ${
      active ? "text-white" : "text-white/55 hover:text-white hover:bg-white/10"
    }`;

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
        const active = isActive(path, exact);
        return (
          <Link
            key={path}
            href={`${base}${path}`}
            className={linkClass(active)}
            style={{
              borderRadius: "var(--brand-radius, 8px)",
              backgroundColor: active ? "rgba(255,255,255,0.15)" : undefined,
            }}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </Link>
        );
      })}

      <div
        className="pt-2 mt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Link
          href={`${base}/settings`}
          className={linkClass(pathname.startsWith(`${base}/settings`))}
          style={{
            borderRadius: "var(--brand-radius, 8px)",
            backgroundColor: pathname.startsWith(`${base}/settings`)
              ? "rgba(255,255,255,0.15)"
              : undefined,
          }}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          Emlak Ayarları
        </Link>
      </div>
    </nav>
  );
}
