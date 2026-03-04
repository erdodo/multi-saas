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
  { path: "",               label: "Genel Bakış",      icon: LayoutDashboard, exact: true  },
  { path: "/properties",    label: "Mülklerim",        icon: Building2,       exact: false },
  { path: "/owners",        label: "Mülk Sahipleri",   icon: UserRound,       exact: false },
  { path: "/tenants",       label: "Kiracılar",        icon: Users,           exact: false },
  { path: "/leases",        label: "Kira Sözleşmeleri",icon: FileText,        exact: false },
  { path: "/payments",      label: "Ödemeler",         icon: CreditCard,      exact: false },
  { path: "/subscriptions", label: "Abonelikler",      icon: Zap,             exact: false },
  { path: "/documents",     label: "Belgeler",         icon: FolderOpen,      exact: false },
];

interface Props {
  tenantSlug:    string;
  primaryColor:  string;
  textOnPrimary: string;
}

export function EmlakSidebarNav({ tenantSlug, primaryColor, textOnPrimary }: Props) {
  const pathname = usePathname();
  const base = `/${tenantSlug}/emlak-panel/dashboard`;

  const isActive = (path: string, exact?: boolean) => {
    const href = `${base}${path}`;
    return exact
      ? pathname === href
      : pathname.startsWith(href) && (path !== "" || pathname === href);
  };

  const activeStyle = { backgroundColor: primaryColor, color: textOnPrimary };

  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
        <Link
          key={path}
          href={`${base}${path}`}
          style={isActive(path, exact) ? activeStyle : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
            isActive(path, exact)
              ? ""
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {label}
        </Link>
      ))}

      <div className="pt-2 border-t border-slate-100 mt-2">
        <Link
          href={`${base}/settings`}
          style={pathname.startsWith(`${base}/settings`) ? activeStyle : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
            pathname.startsWith(`${base}/settings`)
              ? ""
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          Emlak Ayarları
        </Link>
      </div>
    </nav>
  );
}
