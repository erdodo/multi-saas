"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  updateTenantInfo,
  updateBranding,
  updateUserInfo,
  updatePassword,
} from "./actions";
import { Building2, User, Lock, Palette, Sun, Moon, Check } from "lucide-react";
import Image from "next/image";

interface TenantData {
  name: string;
  slug: string | null;
  siteTitle: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textOnPrimary: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
}

interface Props {
  tenant: TenantData;
  user: { name: string; email: string };
}

function FormInput({
  label,
  hint,
  ...props
}: {
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full border border-slate-200 rounded-[var(--brand-radius,8px)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)] bg-white"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function SaveBtn({
  label = "Kaydet",
  onClick,
  saving,
}: {
  label?: string;
  onClick: () => void;
  saving: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="w-full rounded-[var(--brand-radius,8px)] py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
      style={{ backgroundColor: "var(--brand-primary, #3b82f6)" }}
    >
      {saving ? "Kaydediliyor..." : label}
    </button>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-[var(--brand-radius,8px)] border border-slate-200 cursor-pointer p-0.5"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={7}
          className="w-28 border border-slate-200 rounded-[var(--brand-radius,8px)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)]"
        />
      </div>
    </div>
  );
}

const TABS = [
  { key: "business", label: "İşletme", icon: Building2 },
  { key: "branding", label: "Marka", icon: Palette },
  { key: "user", label: "Kullanıcı", icon: User },
  { key: "password", label: "Şifre", icon: Lock },
] as const;

type Tab = (typeof TABS)[number]["key"];

const FONTS = [
  { key: "inter", label: "Inter", sample: "font-sans" },
  { key: "poppins", label: "Poppins", sample: "font-sans" },
  { key: "roboto", label: "Roboto", sample: "font-sans" },
  { key: "system", label: "System Default", sample: "font-sans" },
];

const RADII = [
  { key: "none", label: "Köşeli", style: "rounded-none" },
  { key: "sm", label: "Az Yuvarlak", style: "rounded-sm" },
  { key: "md", label: "Orta", style: "rounded-md" },
  { key: "lg", label: "Yuvarlak", style: "rounded-lg" },
  { key: "full", label: "Tam", style: "rounded-full" },
];

export default function SettingsClient({ tenant, user }: Props) {
  const [tab, setTab] = useState<Tab>("business");
  const [saving, setSaving] = useState(false);

  /* ── İşletme formu ── */
  const [biz, setBiz] = useState({
    name: tenant.name,
    slug: tenant.slug ?? "",
  });
  const saveBiz = async () => {
    setSaving(true);
    const r = await updateTenantInfo(biz);
    setSaving(false);
    if (r.success) toast.success("İşletme bilgileri güncellendi");
    else toast.error(r.error);
  };

  /* ── Branding formu ── */
  const [brand, setBrand] = useState({
    siteTitle: tenant.siteTitle ?? "",
    logoUrl: tenant.logoUrl ?? "",
    faviconUrl: tenant.faviconUrl ?? "",
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    accentColor: tenant.accentColor,
    textOnPrimary: tenant.textOnPrimary,
    fontFamily: tenant.fontFamily,
    borderRadius: tenant.borderRadius,
    darkMode: tenant.darkMode,
  });
  const saveBrand = async () => {
    setSaving(true);
    const r = await updateBranding(
      brand as Parameters<typeof updateBranding>[0],
    );
    setSaving(false);
    if (r.success) {
      toast.success("Marka ayarları kaydedildi");
    } else {
      toast.error(r.error ?? "Bir hata oluştu");
    }
  };

  /* ── Kullanıcı formu ── */
  const [usr, setUsr] = useState({ name: user.name, email: user.email });
  const saveUsr = async () => {
    setSaving(true);
    const r = await updateUserInfo(usr);
    setSaving(false);
    if (r.success) toast.success("Bilgiler güncellendi");
    else toast.error(r.error);
  };

  /* ── Şifre formu ── */
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const savePwd = async () => {
    if (pwd.next !== pwd.confirm) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    setSaving(true);
    const r = await updatePassword({ current: pwd.current, next: pwd.next });
    setSaving(false);
    if (r.success) {
      toast.success("Şifre güncellendi");
      setPwd({ current: "", next: "", confirm: "" });
    } else toast.error(r.error);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
        <p className="text-slate-500 text-sm">
          İşletme, marka ve hesap bilgilerinizi yönetin
        </p>
      </div>

      {/* Sekme Çubuğu */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--brand-radius,8px)] text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── İşletme ── */}
      {tab === "business" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
          <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
            İşletme Bilgileri
          </h2>
          <FormInput
            label="İşletme Adı"
            value={biz.name}
            onChange={(e) => setBiz((b) => ({ ...b, name: e.target.value }))}
          />
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              URL Adresi (slug)
            </label>
            <div className="flex items-center gap-0">
              <span className="text-sm text-slate-400 border border-r-0 border-slate-200 bg-slate-50 rounded-l-[var(--brand-radius,8px)] px-3 py-2.5 whitespace-nowrap">
                sitem.com/
              </span>
              <input
                value={biz.slug}
                onChange={(e) =>
                  setBiz((b) => ({
                    ...b,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                className="flex-1 border border-slate-200 rounded-r-[var(--brand-radius,8px)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)]"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sadece küçük harf, rakam ve tire (-) kullanabilirsiniz
            </p>
          </div>
          <SaveBtn onClick={saveBiz} saving={saving} />
        </div>
      )}

      {/* ── Marka ── */}
      {tab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sol — Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Site Kimliği */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Site Kimliği
              </h2>
              <FormInput
                label="Site Başlığı"
                placeholder="Örn: Güzellik Salonu | Randevu"
                value={brand.siteTitle}
                onChange={(e) =>
                  setBrand((b) => ({ ...b, siteTitle: e.target.value }))
                }
                hint="Tarayıcı sekmesinde ve arama sonuçlarında görünür"
              />
              <FormInput
                label="Logo URL"
                placeholder="https://cdn.orneksite.com/logo.png"
                value={brand.logoUrl}
                onChange={(e) =>
                  setBrand((b) => ({ ...b, logoUrl: e.target.value }))
                }
                hint="PNG / SVG önerilir. Boş bırakırsanız ilk harf gösterilir."
              />
              {brand.logoUrl && (
                <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2">Logo Önizleme</p>
                  <Image
                    src={brand.logoUrl}
                    alt="Logo önizleme"
                    width={120}
                    height={40}
                    className="max-h-10 w-auto object-contain"
                    unoptimized
                  />
                </div>
              )}
              <FormInput
                label="Favicon URL"
                placeholder="https://cdn.orneksite.com/favicon.ico"
                value={brand.faviconUrl}
                onChange={(e) =>
                  setBrand((b) => ({ ...b, faviconUrl: e.target.value }))
                }
                hint="ICO veya PNG formatı, 32×32 px önerilir"
              />
            </div>

            {/* Renkler */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Renk Paleti
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Ana Renk"
                  value={brand.primaryColor}
                  onChange={(v) => setBrand((b) => ({ ...b, primaryColor: v }))}
                />
                <ColorInput
                  label="Ana Renk Üstü Metin"
                  value={brand.textOnPrimary}
                  onChange={(v) =>
                    setBrand((b) => ({ ...b, textOnPrimary: v }))
                  }
                />
                <ColorInput
                  label="İkincil Renk"
                  value={brand.secondaryColor}
                  onChange={(v) =>
                    setBrand((b) => ({ ...b, secondaryColor: v }))
                  }
                />
                <ColorInput
                  label="Vurgu Rengi"
                  value={brand.accentColor}
                  onChange={(v) => setBrand((b) => ({ ...b, accentColor: v }))}
                />
              </div>
            </div>

            {/* Yazı Tipi */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Yazı Tipi
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() =>
                      setBrand((b) => ({ ...b, fontFamily: f.key }))
                    }
                    className={`flex items-center justify-between px-4 py-3 rounded-[var(--brand-radius,12px)] border-2 transition-colors ${
                      brand.fontFamily === f.key
                        ? "border-[var(--brand-primary,#3b82f6)] bg-[var(--brand-primary,#3b82f6)] bg-opacity-10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-sm text-slate-700">{f.label}</span>
                    {brand.fontFamily === f.key && (
                      <Check className="w-4 h-4 text-[var(--brand-primary,#3b82f6)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Kenar Yarıçapı */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
                Kenar Yuvarlama
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {RADII.map((r) => (
                  <button
                    key={r.key}
                    onClick={() =>
                      setBrand((b) => ({ ...b, borderRadius: r.key }))
                    }
                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-colors ${
                      brand.borderRadius === r.key
                        ? "border-[var(--brand-primary,#3b82f6)] bg-[var(--brand-primary,#3b82f6)] bg-opacity-10"
                        : "border-slate-200 hover:border-slate-300"
                    } ${r.style}`}
                  >
                    <div
                      className={`w-8 h-8 bg-slate-300 ${r.style}`}
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                    <span className="text-xs text-slate-600 text-center leading-tight">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Karanlık Mod */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Karanlık Mod</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Uygulama arka planını koyu yapın
                  </p>
                </div>
                <button
                  onClick={() =>
                    setBrand((b) => ({ ...b, darkMode: !b.darkMode }))
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors flex items-center ${
                    brand.darkMode
                      ? "bg-slate-800 justify-end"
                      : "bg-slate-200 justify-start"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shadow mx-0.5 transition-colors ${
                      brand.darkMode ? "bg-white" : "bg-white"
                    }`}
                  >
                    {brand.darkMode ? (
                      <Moon className="w-3 h-3 text-slate-700" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            <SaveBtn
              label="Marka Ayarlarını Kaydet"
              onClick={saveBrand}
              saving={saving}
            />
          </div>

          {/* Sağ — Önizleme */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Canlı Önizleme
              </p>
              <div
                className={`rounded-2xl border overflow-hidden shadow-sm ${brand.darkMode ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"}`}
              >
                {/* Mock Header */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  <div
                    className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold"
                    style={{ color: brand.textOnPrimary }}
                  >
                    {(brand.siteTitle || "S").charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: brand.textOnPrimary }}
                  >
                    {brand.siteTitle || "Site Başlığı"}
                  </span>
                </div>

                {/* Mock Nav */}
                <div
                  className={`px-4 py-3 space-y-1 ${brand.darkMode ? "bg-slate-800" : "bg-white"} border-b ${brand.darkMode ? "border-slate-700" : "border-slate-100"}`}
                >
                  {["Anasayfa", "Müşteriler", "Takvim"].map((item, i) => (
                    <div
                      key={item}
                      className="px-3 py-2 text-xs rounded-lg flex items-center gap-2"
                      style={
                        i === 0
                          ? {
                              backgroundColor: brand.primaryColor,
                              color: brand.textOnPrimary,
                            }
                          : {
                              color: brand.darkMode ? "#94a3b8" : "#64748b",
                            }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Mock Content */}
                <div className="p-4 space-y-3">
                  <div
                    className="h-20 rounded-xl flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: brand.accentColor + "20",
                      color: brand.accentColor,
                    }}
                  >
                    İçerik Alanı
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-8 rounded-lg"
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                    <div
                      className="flex-1 h-8 rounded-lg"
                      style={{ backgroundColor: brand.secondaryColor }}
                    />
                    <div
                      className="flex-1 h-8 rounded-lg"
                      style={{ backgroundColor: brand.accentColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Renk Swatches */}
              <div className="mt-4 flex gap-2">
                {[
                  { c: brand.primaryColor, l: "Ana" },
                  { c: brand.secondaryColor, l: "İkincil" },
                  { c: brand.accentColor, l: "Vurgu" },
                ].map(({ c, l }) => (
                  <div
                    key={l}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full h-6 rounded-md"
                      style={{ backgroundColor: c }}
                    />
                    <span className="text-xs text-slate-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Kullanıcı ── */}
      {tab === "user" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
          <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Hesap Bilgileri
          </h2>
          <FormInput
            label="Ad Soyad"
            value={usr.name}
            onChange={(e) => setUsr((u) => ({ ...u, name: e.target.value }))}
          />
          <FormInput
            label="E-posta"
            type="email"
            value={usr.email}
            onChange={(e) => setUsr((u) => ({ ...u, email: e.target.value }))}
          />
          <SaveBtn onClick={saveUsr} saving={saving} />
        </div>
      )}

      {/* ── Şifre ── */}
      {tab === "password" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg space-y-4">
          <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Şifre Değiştir
          </h2>
          <FormInput
            label="Mevcut Şifre"
            type="password"
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
          />
          <FormInput
            label="Yeni Şifre"
            type="password"
            value={pwd.next}
            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
          />
          <FormInput
            label="Yeni Şifre (Tekrar)"
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
          />
          <SaveBtn label="Şifreyi Değiştir" onClick={savePwd} saving={saving} />
        </div>
      )}
    </div>
  );
}
