"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Zap, Pencil, Trash2 } from "lucide-react";
import { Modal } from "../shared/Modal";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/modules/emlak/actions/subscription.actions";
import { SUBSCRIPTION_TYPES } from "@/modules/emlak/utils/constants";

interface Property { id: string; title: string }
interface Subscription {
  id: string; type: string; subscriberNo: string | null;
  provider: string | null; estimatedMonthlyAmount: number | null;
  currency: string; isActive: boolean; notes: string | null;
  property: { id: string; title: string };
}

interface Props {
  tenantId:    string;
  tenantSlug:  string;
  initialData: Subscription[];
  properties:  Property[];
}

const EMPTY_FORM = {
  propertyId: "", type: "ELECTRICITY", subscriberNo: "",
  provider: "", estimatedMonthlyAmount: "", currency: "TRY", isActive: true, notes: "",
};

export function SubscriptionsClient({ tenantId, tenantSlug, initialData, properties }: Props) {
  const router = useRouter();
  const [modal, setModal]       = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [propFilter, setPropFilter] = useState("ALL");
  const [error, setError]       = useState("");
  const [isPending, startTr]    = useTransition();

  const filtered = propFilter === "ALL" ? initialData : initialData.filter(s => s.property.id === propFilter);

  // Group by property
  const groups: Record<string, Subscription[]> = {};
  filtered.forEach(s => {
    const key = s.property.id;
    groups[key] = groups[key] ? [...groups[key], s] : [s];
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTr(async () => {
      if (modal === "create") {
        const res = await createSubscription({
          ...form,
          estimatedMonthlyAmount: (form as any).estimatedMonthlyAmount ? Number((form as any).estimatedMonthlyAmount) : undefined,
          subscriberNo:  form.subscriberNo  || undefined,
          provider:      form.provider      || undefined,
          notes:         form.notes         || undefined,
        }, tenantId, tenantSlug);
        if (!res.success) { setError(res.error ?? "Hata"); return; }
      } else if (modal === "edit" && selected) {
        const res = await updateSubscription(selected.id, {
          ...form,
          estimatedMonthlyAmount: (form as any).estimatedMonthlyAmount ? Number((form as any).estimatedMonthlyAmount) : undefined,
          subscriberNo:  form.subscriberNo  || undefined,
          provider:      form.provider      || undefined,
          notes:         form.notes         || undefined,
        }, tenantId, tenantSlug);
        if (!res.success) { setError(res.error ?? "Hata"); return; }
      }
      setModal(null); router.refresh();
    });
  }

  function handleDelete() {
    if (!selected) return;
    startTr(async () => {
      const res = await deleteSubscription(selected.id, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(null); router.refresh();
    });
  }

  const typeLabel = (t: string) => SUBSCRIPTION_TYPES[t as keyof typeof SUBSCRIPTION_TYPES] ?? t;
  const typeIcon  = (t: string) => {
    const icons: Record<string, string> = {
      ELECTRICITY: "⚡", NATURAL_GAS: "🔥", WATER: "💧", INTERNET: "🌐",
      CABLE_TV: "📺", ELEVATOR: "🛗", BUILDING_MANAGEMENT: "🏢", OTHER: "🔧",
    };
    return icons[t] ?? "🔧";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abonelikler</h1>
          <p className="text-sm text-slate-500">Elektrik, doğalgaz, su vb. abonelik takibi</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setError(""); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Abonelik Ekle
        </button>
      </div>

      {/* Property Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setPropFilter("ALL")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${propFilter === "ALL" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          Tümü
        </button>
        {properties.map(p => (
          <button key={p.id} onClick={() => setPropFilter(p.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${propFilter === p.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {p.title}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 flex flex-col items-center gap-3">
          <Zap className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">Abonelik bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([propId, subs]) => {
            const propTitle = subs[0].property.title;
            return (
              <div key={propId} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">{propTitle}</h3>
                  <span className="text-xs text-slate-500">{subs.length} abonelik</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {subs.map(s => (
                    <div key={s.id} className="px-5 py-3.5 flex items-center gap-4 group hover:bg-slate-50">
                      <span className="text-2xl">{typeIcon(s.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">{typeLabel(s.type)}</p>
                          {!s.isActive && (
                            <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">Pasif</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-slate-500">
                          {s.subscriberNo && <span>Abone No: <strong>{s.subscriberNo}</strong></span>}
                          {s.provider     && <span>Sağlayıcı: {s.provider}</span>}
                          {s.estimatedMonthlyAmount && (
                            <span className="font-medium text-slate-700">
                              ₺{s.estimatedMonthlyAmount.toLocaleString("tr-TR")}/ay
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(s)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modal === "create" || modal === "edit"} onClose={() => setModal(null)}
        title={modal === "create" ? "Abonelik Ekle" : "Abonelik Düzenle"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mülk *</label>
              <select name="propertyId" value={form.propertyId} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Abonelik Türü *</label>
              <select name="type" value={form.type} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(SUBSCRIPTION_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Abone No</label>
              <input name="subscriberNo" value={form.subscriberNo} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sağlayıcı / Şirket</label>
              <input name="provider" value={form.provider} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aylık Tahmini Tutar</label>
              <div className="flex gap-2">
              <input type="number" name="estimatedMonthlyAmount" value={(form as any).estimatedMonthlyAmount} onChange={handleChange} min="0" step="0.01"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="currency" value={form.currency} onChange={handleChange}
                  className="w-20 px-2 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["TRY","USD","EUR"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input type="checkbox" name="isActive" id="isActive" checked={form.isActive as boolean} onChange={handleChange} className="w-4 h-4 rounded text-blue-600" />
              <label htmlFor="isActive" className="text-sm text-slate-700 cursor-pointer">Aktif</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
            <button type="submit" disabled={isPending} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Aboneliği Sil" size="sm">
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <p className="text-sm text-slate-600">
            <strong>{selected?.property.title}</strong> — {selected ? typeLabel(selected.type) : ""} aboneliğini silmek istediğinize emin misiniz?
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
            <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
              {isPending ? "Siliniyor..." : "Sil"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );

  function openEdit(s: Subscription) {
    setSelected(s);
    setForm({
      propertyId: s.property.id, type: s.type,
      subscriberNo:  s.subscriberNo  ?? "",
      provider:      s.provider      ?? "",
      estimatedMonthlyAmount: s.estimatedMonthlyAmount != null ? String(s.estimatedMonthlyAmount) : "",
      currency:      s.currency,
      isActive:      s.isActive,
      notes:         s.notes ?? "",
    });
    setError(""); setModal("edit");
  }

  function openDelete(s: Subscription) {
    setSelected(s); setError(""); setModal("delete");
  }
}
