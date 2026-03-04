"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Scissors,
  Home,
} from "lucide-react";

interface Module { key: string; name: string }
interface Props { tenantSlug: string; modules?: Module[] }

export function NavLinks({ tenantSlug, modules = [] }: Props) {
  const pathname = usePathname();
  const base     = `/${tenantSlug}/app`;
  const moduleKeys = modules.map((m) => m.key);

  const NAV_ITEMS = [
    { href: base,                label: "Uygulamalarım",  icon: LayoutDashboard, exact: true,  moduleKey: null       },
    { href: `${base}/customers`, label: "Müşteriler",     icon: Users,           exact: false, moduleKey: null       },
    { href: `${base}/calendar`,  label: "Takvim",         icon: CalendarDays,    exact: false, moduleKey: null       },
    { href: `${base}/randevu`,   label: "Randevu Modülü", icon: Scissors,        exact: false, moduleKey: "randevu"  },
    { href: `${base}/emlak`,     label: "Emlak Modülü",   icon: Home,            exact: false, moduleKey: "emlak"    },
  ];

  const visibleItems = NAV_ITEMS.filter(
    ({ moduleKey }) => !moduleKey || moduleKeys.includes(moduleKey)
  );

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {visibleItems.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
            isActive(href, exact)
              ? "bg-[var(--brand-primary)] text-[var(--brand-text-on-primary)]"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {label}
        </Link>
      ))}
    </>
  );
}
