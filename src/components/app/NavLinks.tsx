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

interface Module {
  key: string;
  name: string;
}
interface Props {
  tenantSlug: string;
  modules?: Module[];
}

export function NavLinks({ tenantSlug, modules = [] }: Props) {
  const pathname = usePathname();
  const base = `/${tenantSlug}/app`;
  const moduleKeys = modules.map((m) => m.key);

  const NAV_ITEMS = [
    {
      href: base,
      label: "Uygulamalarım",
      icon: LayoutDashboard,
      exact: true,
      moduleKey: null,
    },
    {
      href: `${base}/customers`,
      label: "Müşteriler",
      icon: Users,
      exact: false,
      moduleKey: "randevu",
    },
    {
      href: `${base}/calendar`,
      label: "Takvim",
      icon: CalendarDays,
      exact: false,
      moduleKey: "randevu",
    },
    {
      href: `${base}/randevu`,
      label: "Randevu Modülü",
      icon: Scissors,
      exact: false,
      moduleKey: "randevu",
    },
    {
      href: `${base}/emlak`,
      label: "Emlak Modülü",
      icon: Home,
      exact: false,
      moduleKey: "emlak",
    },
  ];

  const visibleItems = NAV_ITEMS.filter(
    ({ moduleKey }) => !moduleKey || moduleKeys.includes(moduleKey),
  );

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {visibleItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 font-medium text-sm transition-all duration-200 ${
              active
                ? "text-white"
                : "text-white/55 hover:text-white hover:bg-white/10"
            }`}
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
    </>
  );
}
