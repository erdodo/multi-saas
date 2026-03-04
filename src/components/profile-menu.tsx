"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  ChevronDown,
  ChevronRight,
  Layers,
  Building2,
  Palette,
  KeyRound,
  LogOut,
  CalendarDays,
  LayoutDashboard,
  Home,
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
  emlak: <Home className="w-4 h-4" />,
};

const MODULE_HREF: Record<string, (slug: string) => string> = {
  randevu: (slug) => `/${slug}/randevu-panel/dashboard`,
  emlak: (slug) => `/${slug}/emlak-panel/dashboard`,
};

export function ProfileMenu({
  name,
  email,
  role,
  tenantSlug,
  primaryColor = "#3b82f6",
  modules = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger — white/transparent for dark sidebar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10"
        style={{ borderRadius: "var(--brand-radius, 8px)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            backgroundColor: primaryColor,
            color: "var(--brand-text-on-primary, #fff)",
          }}
        >
          {name?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          <p className="text-xs text-white/40 truncate">{role}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — pops up above trigger */}
      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-1.5 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {name}
            </p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>

          {/* Apps */}
          <div className="py-1">
            <button
              onClick={() => setAppsOpen((o) => !o)}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-left">Uygulamalar</span>
              <ChevronRight
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${appsOpen ? "rotate-90" : ""}`}
              />
            </button>

            {appsOpen && (
              <div className="pl-4 border-l-2 border-slate-100 ml-4 my-1 space-y-0.5">
                <Link
                  href={`/${tenantSlug}/app`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Ana Uygulama
                </Link>
                {modules.map((mod) => (
                  <Link
                    key={mod.key}
                    href={
                      MODULE_HREF[mod.key]?.(tenantSlug) ?? `/${tenantSlug}/app`
                    }
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {MODULE_ICON[mod.key] ?? <Layers className="w-4 h-4" />}
                    {mod.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 mx-3 my-1" />

          <Link
            href={`/${tenantSlug}/app/settings`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            İşletme Bilgileri
          </Link>

          <Link
            href={`/${tenantSlug}/app/settings#branding`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Palette className="w-4 h-4 text-slate-400" />
            Marka Ayarları
          </Link>

          <Link
            href={`/${tenantSlug}/app/settings#user`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            Kullanıcı & Şifre
          </Link>

          <div className="h-px bg-slate-100 mx-3 my-1" />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
