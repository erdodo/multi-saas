"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck2,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  UserCircle2,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: "",              label: "Genel Bakış",  icon: LayoutDashboard, exact: true  },
  { path: "/calendar",     label: "Takvim",       icon: CalendarDays,    exact: false },
  { path: "/appointments", label: "Randevular",   icon: CalendarCheck2,  exact: false },
  { path: "/services",     label: "Hizmetler",    icon: Briefcase,       exact: false },
  { path: "/staff",        label: "Personel",     icon: UserCircle2,     exact: false },
  { path: "/customers",    label: "Müşteriler",   icon: Users,           exact: false },
  { path: "/reports",      label: "Raporlar",     icon: BarChart3,       exact: false },
];

interface Props {
  tenantSlug:    string;
  primaryColor:  string;
  textOnPrimary: string;
}

export function RandevuSidebarNav({ tenantSlug, primaryColor, textOnPrimary }: Props) {
  const pathname = usePathname();
  const base = `/${tenantSlug}/randevu-panel/dashboard`;

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
          Randevu Ayarları
        </Link>
      </div>
    </nav>
  );
}
