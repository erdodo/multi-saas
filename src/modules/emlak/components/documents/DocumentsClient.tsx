"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Pencil, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { Modal } from "../shared/Modal";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "@/modules/emlak/actions/document.actions";
import { DOCUMENT_TYPES } from "@/modules/emlak/utils/constants";
import { format, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";

interface Property { id: string; title: string }
interface Lease    { id: string; property: { title: string }; propertyTenant: { firstName: string; lastName: string } }
interface Document {
  id: string; type: string; title: string; fileUrl: string | null;
  expiresAt: Date | null; notes: string | null;
  property: { id: string; title: string } | null;
  lease:    { id: string; property: { title: string }; propertyTenant: { firstName: string; lastName: string } } | null;
}

interface Props {
  tenantId:    string;
  tenantSlug:  string;
  initialData: Document[];
  properties:  Property[];
  leases:      Lease[];
}

const EMPTY_FORM = {
  type: "CONTRACT", title: "", fileUrl: "",
  associationType: "NONE" as "NONE" | "PROPERTY" | "LEASE",
  propertyId: "", leaseId: "", expiresAt: "", notes: "",
};

export function DocumentsClient({ tenantId, tenantSlug, initialData, properties, leases }: Props) {
  const router = useRouter();
  const [filter, setFilter]     = useState("ALL");
  const [modal, setModal]       = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Document | null>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [error, setError]       = useState("");
  const [isPending, startTr]    = useTransition();

  const filtered = filter === "ALL" ? initialData : initialData.filter(d => d.type === filter);

  // Expiry helpers
  const expiryDays = (d: Document) => d.expiresAt ? differenceInDays(new Date(d.expiresAt), new Date()) : null;
  const isExpiring = (d: Document) => { const days = expiryDays(d); return days !== null && days <= 30 && days >= 0; };
  const isExpired  = (d: Document) => { const days = expiryDays(d); return days !== null && days < 0; };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTr(async () => {
      const payload: Parameters<typeof createDocument>[0] = {
        type:       form.type,
        title:      form.title,
        fileUrl:    form.fileUrl    || undefined,
        propertyId: form.associationType === "PROPERTY" ? form.propertyId || undefined : undefined,
        leaseId:    form.associationType === "LEASE"    ? form.leaseId    || undefined : undefined,
        expiresAt:  form.expiresAt  || undefined,
        notes:      form.notes      || undefined,
      };
      if (modal === "create") {
        const res = await createDocument(payload, tenantId, tenantSlug);
        if (!res.success) { setError(res.error ?? "Hata"); return; }
      } else if (modal === "edit" && selected) {
        const res = await updateDocument(selected.id, payload, tenantId, tenantSlug);
        if (!res.success) { setError(res.error ?? "Hata"); return; }
      }
      setModal(null); router.refresh();
    });
  }

  function handleDelete() {
    if (!selected) return;
    startTr(async () => {
      const res = await deleteDocument(selected.id, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(null); router.refresh();
    });
  }

  const docLabel = (t: string) => DOCUMENT_TYPES[t as keyof typeof DOCUMENT_TYPES] ?? t;

  // Count expiring/expired
  const expiringCount = initialData.filter(d => isExpiring(d) || isExpired(d)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Belgeler</h1>
          <p className="text-sm text-slate-500">{initialData.length} belge</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setError(""); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Belge Ekle
        </button>
      </div>

      {expiringCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{expiringCount} belge</strong> yakında sona eriyor veya süresi geçmiş.
          </p>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter("ALL")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === "ALL" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          Tümü
        </button>
        {Object.entries(DOCUMENT_TYPES).map(([k, v]) => {
          const count = initialData.filter(d => d.type === k).length;
          if (count === 0) return null;
          return (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === k ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {v} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 flex flex-col items-center gap-3">
          <FileText className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">Belge bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map(d => {
            const expired  = isExpired(d);
            const expiring = isExpiring(d);
            const days     = expiryDays(d);
            return (
              <div key={d.id} className={`px-5 py-4 flex items-start gap-4 group hover:bg-slate-50 transition-colors ${expired ? "bg-red-50/40" : expiring ? "bg-amber-50/40" : ""}`}>
                <FileText className={`w-5 h-5 mt-0.5 flex-shrink-0 ${expired ? "text-red-400" : expiring ? "text-amber-400" : "text-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                    <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">{docLabel(d.type)}</span>
                    {expired  && <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Süresi Geçmiş</span>}
                    {expiring && !expired && <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">{days} gün kaldı</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                    {d.property && <span>🏠 {d.property.title}</span>}
                    {d.lease    && <span>📄 {d.lease.property.title} — {d.lease.propertyTenant.firstName} {d.lease.propertyTenant.lastName}</span>}
                    {d.expiresAt && <span className={expired ? "text-red-600 font-medium" : expiring ? "text-amber-600 font-medium" : ""}>
                      Son geçerlilik: {format(new Date(d.expiresAt), "d MMMM yyyy", { locale: tr })}
                    </span>}
                  </div>
                  {d.notes && <p className="text-xs text-slate-400 mt-1 truncate">{d.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.fileUrl && (
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => openEdit(d)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => openDelete(d)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modal === "create" || modal === "edit"} onClose={() => setModal(null)}
        title={modal === "create" ? "Belge Ekle" : "Belge Düzenle"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Belge Türü *</label>
            <select name="type" value={form.type} onChange={handleChange} required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(DOCUMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dosya URL</label>
            <input name="fileUrl" value={form.fileUrl} onChange={handleChange} placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">İlişkilendirme</label>
            <select name="associationType" value={form.associationType} onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="NONE">Genel Belge</option>
              <option value="PROPERTY">Mülk ile İlişkilendir</option>
              <option value="LEASE">Sözleşme ile İlişkilendir</option>
            </select>
          </div>
          {form.associationType === "PROPERTY" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mülk</label>
              <select name="propertyId" value={form.propertyId} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}
          {form.associationType === "LEASE" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sözleşme</label>
              <select name="leaseId" value={form.leaseId} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {leases.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.property.title} — {l.propertyTenant.firstName} {l.propertyTenant.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Son Geçerlilik Tarihi</label>
            <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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
      <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Belgeyi Sil" size="sm">
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <p className="text-sm text-slate-600">
            <strong>{selected?.title}</strong> belgesini silmek istediğinize emin misiniz?
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

  function openEdit(d: Document) {
    setSelected(d);
    setForm({
      type:     d.type,
      title:    d.title,
      fileUrl:  d.fileUrl   ?? "",
      associationType: d.lease ? "LEASE" : d.property ? "PROPERTY" : "NONE",
      propertyId:    d.property?.id ?? "",
      leaseId:       d.lease?.id    ?? "",
      expiresAt:     d.expiresAt ? new Date(d.expiresAt).toISOString().split("T")[0] : "",
      notes:         d.notes  ?? "",
    });
    setError(""); setModal("edit");
  }

  function openDelete(d: Document) {
    setSelected(d); setError(""); setModal("delete");
  }
}
