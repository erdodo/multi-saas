"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { createStaff } from "@/modules/randevu/actions/staff.actions";

interface Service { id: string; name: string }
interface Props { services: Service[]; tenantId: string; tenantSlug: string }

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export default function NewStaffForm({ services, tenantId, tenantSlug }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", bio: "", color: "#3b82f6" });
  const [availability, setAvailability] = useState(
    Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i + 1, isActive: i < 5, startTime: "09:00", endTime: "18:00" }))
  );

  const toggleService = (id: string) =>
    setSelectedServices((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const [serviceError, setServiceError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Ad zorunludur"); return; }
    if (selectedServices.length === 0) {
      setServiceError(true);
      toast.error("En az bir hizmet seçilmelidir");
      return;
    }
    setServiceError(false);
    setSaving(true);
    try {
      const result = await createStaff(
        { ...form, isActive: true, serviceIds: selectedServices, availability: availability.filter((a) => a.isActive) },
        tenantId
      );
      if (!result.success) { toast.error(result.error); return; }
      toast.success("Personel eklendi");
      router.push(`/${tenantSlug}/randevu-panel/dashboard/staff`);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b pb-3">👤 Kişisel Bilgiler</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm text-gray-700 mb-1">Ad Soyad *</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm text-gray-700 mb-1">Telefon</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Biyografi</label>
            <textarea rows={2} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Takvim rengi</label>
            <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="h-10 w-full rounded border border-gray-300" />
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-xl border p-5 space-y-3 ${serviceError ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}>
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-gray-900">💼 Hizmetler</h2>
          {serviceError && <span className="text-xs text-red-500 font-medium">En az bir hizmet seçin</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => {
            const selected = selectedServices.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { toggleService(s.id); setServiceError(false); }}
                style={selected ? { backgroundColor: form.color, color: "#fff", borderColor: form.color } : undefined}
                className={`inline-flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 border font-medium transition-all ${
                  selected
                    ? "shadow-sm"
                    : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                {s.name}
              </button>
            );
          })}
          {services.length === 0 && <p className="text-sm text-gray-400">Önce hizmet tanımlayın</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900 border-b pb-3">📅 Çalışma Saatleri</h2>
        {availability.map((a, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr] gap-4 items-center">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={a.isActive}
                onChange={(e) => setAvailability((av) => av.map((x, j) => j === i ? { ...x, isActive: e.target.checked } : x))} />
              <span className="text-sm text-gray-700">{DAYS[i]}</span>
            </div>
            {a.isActive ? (
              <div className="flex items-center gap-2">
                <input type="time" value={a.startTime}
                  onChange={(e) => setAvailability((av) => av.map((x, j) => j === i ? { ...x, startTime: e.target.value } : x))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm" />
                <span className="text-gray-400">—</span>
                <input type="time" value={a.endTime}
                  onChange={(e) => setAvailability((av) => av.map((x, j) => j === i ? { ...x, endTime: e.target.value } : x))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm" />
              </div>
            ) : <span className="text-sm text-gray-400 italic">Kapalı</span>}
          </div>
        ))}
      </div>

      <button type="submit" disabled={saving} className="w-full btn-brand rounded-xl py-3 font-medium transition-colors">
        {saving ? "Kaydediliyor..." : "➕ Personel Ekle"}
      </button>
    </form>
  );
}
