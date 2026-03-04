"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User, ChevronDown, ChevronRight, Layers, Building2,
  Palette, KeyRound, LogOut, CalendarDays, LayoutDashboard, Home,
} from "lucide-react";

interface ModuleItem {
  key: string;
  name: string;
}

interface Props {
  name: string;
  email: string;
  role: string;
  tenantSlug: string;
  primaryColor?: string;
  modules?: ModuleItem[];
}

const MODULE_ICON: Record<string, React.ReactNode> = {
  randevu: <CalendarDays className="w-4 h-4" />,
  emlak:   <Home className="w-4 h-4" />,
};

const MODULE_HREF: Record<string, (slug: string) => string> = {
  randevu: (slug) => `/${slug}/randevu-panel/dashboard`,
  emlak:   (slug) => `/${slug}/emlak-panel/dashboard`,
};

export function ProfileMenu({ name, email, role, tenantSlug, primaryColor = "#3b82f6", modules = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {name?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-slate-900 truncate dark:text-white">{name}</p>
          <p className="text-xs text-slate-400 truncate">{role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1 dark:bg-slate-800 dark:border-slate-700">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>

          {/* Apps */}
          <div className="py-1">
            <button
              onClick={() => setAppsOpen((o) => !o)}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-left">Uygulamalar</span>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${appsOpen ? "rotate-90" : ""}`} />
            </button>

            {appsOpen && (
              <div className="pl-4 border-l-2 border-slate-100 ml-4 my-1 space-y-0.5 dark:border-slate-700">
                {/* Main App link */}
                <Link
                  href={`/${tenantSlug}/app`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Ana Uygulama
                </Link>
                {/* Modules */}
                {modules.map((mod) => (
                  <Link
                    key={mod.key}
                    href={MODULE_HREF[mod.key]?.(tenantSlug) ?? `/${tenantSlug}/app`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
                  >
                    {MODULE_ICON[mod.key] ?? <Layers className="w-4 h-4" />}
                    {mod.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 mx-3 my-1 dark:bg-slate-700" />

          {/* İşletme Bilgileri */}
          <Link
            href={`/${tenantSlug}/app/settings`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            İşletme Bilgileri
          </Link>

          {/* Marka Bilgileri */}
          <Link
            href={`/${tenantSlug}/app/settings#branding`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Palette className="w-4 h-4 text-slate-400" />
            Marka Bilgileri
          </Link>

          {/* Kullanıcı & Şifre */}
          <Link
            href={`/${tenantSlug}/app/settings#user`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            Kullanıcı & Şifre
          </Link>

          <div className="h-px bg-slate-100 mx-3 my-1 dark:bg-slate-700" />

          {/* Çıkış */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
