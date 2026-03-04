"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Pencil, XCircle, Calendar } from "lucide-react";
import { Modal } from "../shared/Modal";
import { StatusBadge } from "../shared/StatusBadge";
import { createLease, endLease } from "@/modules/emlak/actions/lease.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Property  { id: string; title: string; address: string | null; status: string }
interface TenantItem { id: string; firstName: string; lastName: string; phone: string | null }
interface Owner      { id: string; firstName: string; lastName: string }
interface Lease {
  id: string; status: string; startDate: Date; endDate: Date;
  rentAmount: number; currency: string; paymentDayOfMonth: number;
  depositAmount: number; depositPaid: boolean; contractUrl: string | null;
  property:       { id: string; title: string; city: string | null };
  propertyTenant: { id: string; firstName: string; lastName: string; phone: string | null };
  owner:          { id: string; firstName: string; lastName: string } | null;
  payments:       Array<{ id: string; status: string; dueDate: Date; amount: number }>;
  _count:         { payments: number };
}

interface Props {
  tenantId:    string;
  tenantSlug:  string;
  initialData: Lease[];
  properties:  Property[];
  tenantsList: TenantItem[];
  owners:      Owner[];
}

const EMPTY_FORM = {
  propertyId: "", propertyTenantId: "", ownerId: "",
  startDate: "", endDate: "", rentAmount: "", currency: "TRY",
  paymentDayOfMonth: "1", depositAmount: "0", depositPaid: false,
  contractUrl: "", autoRenew: false, renewalRate: "", notes: "",
};

const EMPTY_END = { status: "ENDED" as "ENDED" | "TERMINATED", terminationReason: "", depositReturnDate: "" };

export function LeasesClient({ tenantId, tenantSlug, initialData, properties, tenantsList, owners }: Props) {
  const router = useRouter();
  const [filter, setFilter]     = useState("ACTIVE");
  const [modal, setModal]       = useState<"create" | "end" | null>(null);
  const [selected, setSelected] = useState<Lease | null>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [endForm, setEndForm]   = useState({ ...EMPTY_END });
  const [error, setError]       = useState("");
  const [isPending, startTr]    = useTransition();

  const filtered = filter === "ALL" ? initialData : initialData.filter(l => l.status === filter);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setEndForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTr(async () => {
      const res = await createLease({
        ...form,
        ownerId:           form.ownerId || undefined,
        rentAmount:        Number(form.rentAmount),
        paymentDayOfMonth: Number(form.paymentDayOfMonth),
        depositAmount:     Number(form.depositAmount),
        renewalRate:       form.renewalRate ? Number(form.renewalRate) : undefined,
        contractUrl:       form.contractUrl || undefined,
        notes:             form.notes       || undefined,
      }, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(null); router.refresh();
    });
  }

  function handleEnd() {
    startTr(async () => {
      const res = await endLease({
        leaseId: selected!.id,
        status:  endForm.status,
        terminationReason: endForm.terminationReason || undefined,
        depositReturnDate: endForm.depositReturnDate  || undefined,
      }, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(null); router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kira Sözleşmeleri</h1>
          <p className="text-sm text-slate-500">{filtered.length} sözleşme</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setError(""); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Sözleşme Ekle
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {[["ALL","Tümü"], ["ACTIVE","Aktif"], ["ENDED","Sona Erdi"], ["TERMINATED","Feshedildi"]].map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === k ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {v}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 flex flex-col items-center gap-3">
          <FileText className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">Sözleşme bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map(l => (
            <div key={l.id} className="px-5 py-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{l.property.title}</p>
                    <StatusBadge status={l.status} variant="lease" />
                  </div>
                  <p className="text-sm text-slate-500">
                    <span className="font-medium text-slate-900">{l.propertyTenant.firstName} {l.propertyTenant.lastName}</span>
                    {l.propertyTenant.phone && <span className="ml-2 text-slate-400">· {l.propertyTenant.phone}</span>}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(l.startDate), "d MMM yyyy", { locale: tr })} —{" "}
                      {format(new Date(l.endDate),   "d MMM yyyy", { locale: tr })}
                    </span>
                    <span className="font-semibold text-emerald-600 text-sm">
                      ₺{l.rentAmount.toLocaleString("tr-TR")}/ay
                    </span>
                    {l.depositAmount > 0 && (
                      <span>Depozito: ₺{l.depositAmount.toLocaleString("tr-TR")} {l.depositPaid ? "✓" : "(Ödenmedi)"}</span>
                    )}
                  </div>
                  {l.payments.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {l.payments.slice(0, 3).map(p => (
                        <div key={p.id} className={`text-xs px-2 py-0.5 rounded-full ${
                          p.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                          p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {format(new Date(p.dueDate), "MMM", { locale: tr })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {l.status === "ACTIVE" && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openEnd(l)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Sonlandır
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modal === "create"} onClose={() => setModal(null)} title="Kira Sözleşmesi Ekle" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mülk *</label>
              <select name="propertyId" value={form.propertyId} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {properties.filter(p => p.status !== "RENTED").map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Kiracı *</label>
              <select name="propertyTenantId" value={form.propertyTenantId} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {tenantsList.map(t => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName} {t.phone ? `(${t.phone})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mülk Sahibi</label>
              <select name="ownerId" value={form.ownerId} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz (opsiyonel)</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Tarihi *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş Tarihi *</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aylık Kira *</label>
              <div className="flex gap-2">
                <input type="number" name="rentAmount" value={form.rentAmount} onChange={handleChange} required min="0" step="0.01"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="currency" value={form.currency} onChange={handleChange}
                  className="w-20 px-2 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["TRY","USD","EUR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Günü (Ayın)</label>
              <input type="number" name="paymentDayOfMonth" value={form.paymentDayOfMonth} onChange={handleChange} min="1" max="28"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Depozito</label>
              <input type="number" name="depositAmount" value={form.depositAmount} onChange={handleChange} min="0" step="0.01"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" name="depositPaid" id="depositPaid" checked={form.depositPaid as boolean} onChange={handleChange} className="w-4 h-4 rounded text-blue-600" />
              <label htmlFor="depositPaid" className="text-sm text-slate-700 cursor-pointer">Depozito Alındı</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Sözleşme URL</label>
              <input name="contractUrl" value={form.contractUrl} onChange={handleChange} placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            💡 Sözleşme oluşturulduğunda tüm sözleşme süresine ait aylık ödeme takvimi otomatik oluşturulacaktır.
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
            <button type="submit" disabled={isPending} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
              {isPending ? "Oluşturuluyor..." : "Sözleşme Oluştur"}
            </button>
          </div>
        </form>
      </Modal>

      {/* End Modal */}
      <Modal open={modal === "end"} onClose={() => setModal(null)} title="Sözleşmeyi Sonlandır" size="sm">
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <p className="text-sm text-slate-600">
            <strong>{selected?.property.title}</strong> — {selected?.propertyTenant.firstName} {selected?.propertyTenant.lastName}
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sonlanma Türü</label>
            <select name="status" value={endForm.status} onChange={handleEndChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ENDED">Normal Bitiş</option>
              <option value="TERMINATED">Fesih</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Depozito İade Tarihi</label>
            <input type="date" name="depositReturnDate" value={endForm.depositReturnDate} onChange={handleEndChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {endForm.status === "TERMINATED" ? "Fesih Nedeni" : "Notlar"}
            </label>
            <textarea name="terminationReason" value={endForm.terminationReason} onChange={handleEndChange} rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
            <button onClick={handleEnd} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
              {isPending ? "İşleniyor..." : "Sözleşmeyi Sonlandır"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );

  function openEnd(l: Lease) {
    setSelected(l); setEndForm({ ...EMPTY_END }); setError(""); setModal("end");
  }
}

const Pencil_ = Pencil; void Pencil_; // suppress unused warning
