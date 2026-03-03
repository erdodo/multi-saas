"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  name: string;
  email: string;
}

export function UserMenu({ name, email }: UserMenuProps) {
  return (
    <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 group cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
          <p className="text-xs text-slate-500 truncate">{email}</p>
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
  );
}
