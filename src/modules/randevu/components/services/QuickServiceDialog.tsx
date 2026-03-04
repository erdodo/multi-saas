"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createService } from "@/modules/randevu/actions/service.actions";

interface Service {
  id: string;
  name: string;
}
interface Props {
  tenantId: string;
  onClose: () => void;
  onCreated: (service: Service) => void;
}

export default function QuickServiceDialog({
  tenantId,
  onClose,
  onCreated,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    duration: 30,
    price: 0,
    color: "#3b82f6",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Hizmet adı zorunludur");
      return;
    }
    setSaving(true);
    try {
      const result = await createService(
        {
          name: form.name,
          duration: form.duration,
          price: form.price,
          color: form.color,
          isActive: true,
          bufferTime: 0,
          currency: "TRY",
          maxCapacity: 1,
        },
        tenantId,
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Hizmet eklendi");
      onCreated(result.data as Service);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-(--brand-card-radius) shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">
            ✨ Hızlı Hizmet Ekle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Hizmet Adı *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-[var(--brand-radius,8px)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)]"
              placeholder="ör. Saç Kesimi"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Süre (dk) *
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-[var(--brand-radius,8px)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Fiyat (₺)
              </label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                className="w-full border border-gray-300 rounded-[var(--brand-radius,8px)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Renk</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) =>
                setForm((f) => ({ ...f, color: e.target.value }))
              }
              className="h-10 w-full rounded-[var(--brand-radius,8px)] border border-gray-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-[var(--brand-radius,8px)] py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[var(--brand-primary,#2563eb)] hover:opacity-90 text-[var(--brand-text-on-primary,#fff)] rounded-[var(--brand-radius,8px)] py-2.5 text-sm font-medium transition-opacity disabled:opacity-60"
            >
              {saving ? "Ekleniyor..." : "Hizmet Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
