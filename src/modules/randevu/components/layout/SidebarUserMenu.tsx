"use client";

import { signOut } from "next-auth/react";
import { LogOut, ExternalLink } from "lucide-react";
import { hexToRgba } from "@/modules/randevu/lib/branding";

interface Props {
  name: string;
  email: string;
  role: string;
  tenantSlug: string;
  primaryColor: string;
  textOnPrimary: string;
}

export function SidebarUserMenu({ name, email, role, tenantSlug, primaryColor, textOnPrimary }: Props) {
  return (
    <div className="p-4 border-t border-slate-200 space-y-3">
      {/* Randevu sayfası linki */}
      <a
        href={`/${tenantSlug}/randevu-panel/book`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
        className="flex items-center justify-center gap-2 w-full text-xs font-medium rounded-lg py-2 transition-opacity hover:opacity-80"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Randevu Sayfası
      </a>

      {/* Kullanıcı bilgileri + çıkış */}
      <div className="flex items-center justify-between px-1 py-1 rounded-lg hover:bg-slate-50 group cursor-pointer">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: hexToRgba(primaryColor, 0.15), color: primaryColor }}
          >
            {name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email || role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Çıkış Yap"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
