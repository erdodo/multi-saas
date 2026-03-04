"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateTenantSettings, createHoliday, deleteHoliday } from "@/modules/randevu/actions/tenant.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface TenantSettings {
  bookingWindowDays: number; minNoticeHours: number; maxAppointmentsPerDay: number;
  slotIntervalMinutes: number; autoConfirm: boolean; emailNotifications: boolean;
  smsNotifications: boolean; reminderHoursBefore: number;
  businessHoursStart: string; businessHoursEnd: string; primaryColor: string;
}

interface Holiday { id: string; name: string; date: Date }

interface Props { settings: TenantSettings | null; holidays: Holiday[]; tenantId: string }

export default function SettingsForm({ settings, holidays: initialHolidays, tenantId }: Props) {
  const [form, setForm] = useState({
    bookingWindowDays: settings?.bookingWindowDays ?? 60,
    minNoticeHours: settings?.minNoticeHours ?? 2,
    maxAppointmentsPerDay: settings?.maxAppointmentsPerDay ?? 0,
    slotIntervalMinutes: settings?.slotIntervalMinutes ?? 15,
    autoConfirm: settings?.autoConfirm ?? false,
    emailNotifications: settings?.emailNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? false,
    reminderHoursBefore: settings?.reminderHoursBefore ?? 24,
    businessHoursStart: settings?.businessHoursStart ?? "09:00",
    businessHoursEnd: settings?.businessHoursEnd ?? "18:00",
    primaryColor: settings?.primaryColor ?? "#3b82f6",
  });
  const [saving, setSaving] = useState(false);
  const [holidays, setHolidays] = useState(initialHolidays);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });
  const [addingHoliday, setAddingHoliday] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateTenantSettings(form, tenantId);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Ayarlar kaydedildi");
    } finally { setSaving(false); }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    setAddingHoliday(true);
    try {
      const result = await createHoliday(newHoliday, tenantId);
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Tatil günü eklendi");
      setHolidays([...holidays, result.data!]);
      setNewHoliday({ name: "", date: "" });
    } finally { setAddingHoliday(false); }
  };

  const handleDeleteHoliday = async (id: string) => {
    const result = await deleteHoliday(id, tenantId);
    if (!result.success) { toast.error(result.error); return; }
    setHolidays(holidays.filter((h) => h.id !== id));
    toast.success("Tatil günü silindi");
  };

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm";
  const section = "bg-white rounded-(--brand-card-radius) border border-gray-200 p-5 space-y-4";

  return (
    <div className="space-y-5 max-w-2xl">
      <div className={section}>
        <h2 className="font-semibold text-gray-900 border-b pb-3">⚙️ Randevu Kuralları</h2>
        {[
          { label: "İleri tarih limiti (gün)", key: "bookingWindowDays", min: 1, max: 365 },
          { label: "Min. önceden bildirim (saat)", key: "minNoticeHours", min: 0, max: 168 },
          { label: "Hatırlatma (saat önce)", key: "reminderHoursBefore", min: 1, max: 72 },
        ].map(({ label, key, min, max }) => (
          <div key={key} className="grid grid-cols-2 gap-4 items-center">
            <label className="text-sm text-gray-700">{label}</label>
            <input type="number" min={min} max={max}
              value={form[key as keyof typeof form] as number}
              onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
              className={inp} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-4 items-center">
          <label className="text-sm text-gray-700">Slot aralığı (dk)</label>
          <select value={form.slotIntervalMinutes}
            onChange={(e) => setForm((f) => ({ ...f, slotIntervalMinutes: Number(e.target.value) }))}
            className={inp}>
            {[10, 15, 20, 30, 60].map((v) => <option key={v} value={v}>{v} dakika</option>)}
          </select>
        </div>
        {[
          { label: "Çalışma başlangıç", key: "businessHoursStart" },
          { label: "Çalışma bitiş", key: "businessHoursEnd" },
        ].map(({ label, key }) => (
          <div key={key} className="grid grid-cols-2 gap-4 items-center">
            <label className="text-sm text-gray-700">{label}</label>
            <input type="time" value={form[key as keyof typeof form] as string}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className={inp} />
          </div>
        ))}
        {[
          { id: "autoConfirm", label: "Otomatik onaylama", key: "autoConfirm" },
          { id: "emailNotifs", label: "E-posta bildirimleri", key: "emailNotifications" },
          { id: "smsNotifs", label: "SMS bildirimleri", key: "smsNotifications" },
        ].map(({ id, label, key }) => (
          <div key={id} className="grid grid-cols-2 gap-4 items-center">
            <label className="text-sm text-gray-700">{label}</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" id={id}
                checked={form[key as keyof typeof form] as boolean}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} />
              <label htmlFor={id} className="text-sm text-gray-600">Aktif</label>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full btn-brand rounded-[var(--brand-radius,12px)] py-3 font-medium transition-colors">
        {saving ? "Kaydediliyor..." : "💾 Ayarları Kaydet"}
      </button>

      <div className={section}>
        <h2 className="font-semibold text-gray-900 border-b pb-3">🎉 Tatil / Kapalı Günler</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Tatil adı (ör: Kurban Bayramı)"
            value={newHoliday.name}
            onChange={(e) => setNewHoliday((h) => ({ ...h, name: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={newHoliday.date}
            onChange={(e) => setNewHoliday((h) => ({ ...h, date: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleAddHoliday} disabled={addingHoliday}
            className="btn-brand rounded-lg px-4 py-2 text-sm whitespace-nowrap">Ekle</button>
        </div>
        <div className="space-y-2">
          {holidays.length === 0 ? (
            <p className="text-sm text-gray-400">Tatil günü tanımlanmamış</p>
          ) : (
            holidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{h.name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(h.date), "d MMMM yyyy", { locale: tr })}</p>
                </div>
                <button onClick={() => handleDeleteHoliday(h.id)} className="text-xs text-red-500 hover:text-red-700">Sil</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
