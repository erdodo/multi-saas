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

interface Props { tenantSlug: string }

export function NavLinks({ tenantSlug }: Props) {
  const pathname = usePathname();
  const base     = `/${tenantSlug}/app`;

  const NAV_ITEMS = [
    { href: base,                label: "Uygulamalarım",  icon: LayoutDashboard, exact: true  },
    { href: `${base}/customers`, label: "Müşteriler",     icon: Users,           exact: false },
    { href: `${base}/calendar`,  label: "Takvim",         icon: CalendarDays,    exact: false },
    { href: `${base}/randevu`,   label: "Randevu Modülü", icon: Scissors,        exact: false },
    { href: `${base}/emlak`,     label: "Emlak Modülü",   icon: Home,            exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
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
