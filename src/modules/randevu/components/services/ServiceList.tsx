"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  createService,
  updateService,
  deleteService,
} from "@/modules/randevu/actions/service.actions";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  bufferTime: number;
  price: number | string;
  currency: string;
  color: string | null;
  isActive: boolean;
  maxCapacity: number;
  _count: { appointments: number };
}

const EMPTY_FORM = {
  name: "",
  description: "",
  duration: 30,
  bufferTime: 0,
  price: 0,
  currency: "TRY",
  color: "#3b82f6",
  isActive: true,
  maxCapacity: 1,
};

export default function ServiceList({
  services: initialServices,
  tenantId,
}: {
  services: Service[];
  tenantId: string;
}) {
  const [services, setServices] = useState(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = editingId
        ? await updateService(editingId, form, tenantId)
        : await createService(form, tenantId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editingId ? "Hizmet güncellendi" : "Hizmet eklendi");
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (svc: Service) => {
    setForm({
      name: svc.name,
      description: svc.description ?? "",
      duration: Number(svc.duration),
      bufferTime: Number(svc.bufferTime),
      price: Number(svc.price),
      currency: svc.currency,
      color: svc.color ?? "#3b82f6",
      isActive: svc.isActive,
      maxCapacity: svc.maxCapacity,
    });
    setEditingId(svc.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istiyor musunuz?")) return;
    setLoading(true);
    try {
      const result = await deleteService(id, tenantId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Hizmet silindi");
      setServices((s) => s.filter((svc) => svc.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {
          setShowForm(true);
          setEditingId(null);
          setForm(EMPTY_FORM);
        }}
        className="btn-brand transition-colors"
      >
        + Yeni Hizmet
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--brand-radius,16px)] shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Hizmet Düzenle" : "Yeni Hizmet"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Saç Kesimi"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Süre (dk) *
                </label>
                <input
                  type="number"
                  min={5}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tampon (dk)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.bufferTime}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      bufferTime: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat *
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renk
                </label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, color: e.target.value }))
                  }
                  className="w-full h-9 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxCapacity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxCapacity: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Aktif
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 btn-brand rounded-lg py-2 text-sm font-medium transition-colors"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {services.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">💼</div>
            <p>Henüz hizmet eklenmemiş</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">
                  Hizmet
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">
                  Süre
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">
                  Fiyat
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">
                  Durum
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">
                  Randevu
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: svc.color ?? "#3b82f6" }}
                      />
                      <span className="font-medium text-gray-900">
                        {svc.name}
                      </span>
                    </span>
                    {svc.description && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-5">
                        {svc.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {Number(svc.duration)} dk
                    {Number(svc.bufferTime) > 0 && (
                      <span className="text-gray-400 ml-1">
                        (+{Number(svc.bufferTime)} tampon)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {Number(svc.price) > 0
                      ? `${Number(svc.price).toLocaleString("tr-TR")} ${svc.currency}`
                      : "Ücretsiz"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${svc.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {svc.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {svc._count.appointments}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(svc)}
                      className="text-xs text-blue-600 hover:underline mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(svc.id)}
                      disabled={loading}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
