"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { Modal } from "../shared/Modal";
import {
  createPropertyTenant,
  updatePropertyTenant,
  deletePropertyTenant,
} from "@/modules/emlak/actions/propertyTenant.actions";

interface PrTenant {
  id: string; firstName: string; lastName: string; nationalId: string | null;
  phone: string | null; email: string | null; notes: string | null; isActive: boolean;
  _count: { leases: number };
  leases: Array<{ id: string; property: { title: string } }>;
}

interface Props {
  tenantId:    string;
  tenantSlug:  string;
  initialData: PrTenant[];
}

const EMPTY = {
  firstName: "", lastName: "", nationalId: "", phone: "", phone2: "",
  email: "", emergencyContact: "", emergencyPhone: "", notes: "", isActive: true,
};

export function TenantsClient({ tenantId, tenantSlug, initialData }: Props) {
  const router = useRouter();
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<PrTenant | null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [error, setError]       = useState("");
  const [isPending, startTr]    = useTransition();

  const filtered = initialData.filter(t =>
    !search || [t.firstName, t.lastName, t.phone, t.email]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  function openEdit(t: PrTenant) {
    setSelected(t);
    setForm({
      firstName: t.firstName, lastName: t.lastName, nationalId: t.nationalId ?? "",
      phone: t.phone ?? "", phone2: "", email: t.email ?? "",
      emergencyContact: "", emergencyPhone: "", notes: t.notes ?? "", isActive: t.isActive,
    });
    setError(""); setModal("edit");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    startTr(async () => {
      const res = modal === "create"
        ? await createPropertyTenant(form, tenantId, tenantSlug)
        : await updatePropertyTenant(selected!.id, form, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(null); router.refresh();
    });
  }

  function handleDelete() {
    startTr(async () => {
      const res = await deletePropertyTenant(selected!.id, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Silinemedi"); return; }
      setModal(null); router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kiracılar</h1>
          <p className="text-sm text-slate-500">{filtered.length} kiracı</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY }); setError(""); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Kiracı Ekle
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kiracı ara..."
          className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 flex flex-col items-center gap-3">
          <Users className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">Henüz kiracı eklenmemiş</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 text-sm font-semibold">
                  {t.firstName[0]}{t.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{t.firstName} {t.lastName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {t.phone && <span className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3 h-3" />{t.phone}</span>}
                    {t.email && <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{t.email}</span>}
                  </div>
                  {t.leases[0] && (
                    <p className="text-xs text-blue-600 mt-0.5">{t.leases[0].property.title}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => openEdit(t)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { setSelected(t); setError(""); setModal("delete"); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={modal === "create" || modal === "edit"} onClose={() => setModal(null)}
        title={modal === "create" ? "Kiracı Ekle" : "Kiracıyı Düzenle"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            {([
              ["Ad *", "firstName", true],
              ["Soyad *", "lastName", true],
              ["T.C. Kimlik No", "nationalId", false],
              ["Telefon", "phone", false],
              ["Telefon 2", "phone2", false],
              ["E-posta", "email", false],
              ["Acil Kişi", "emergencyContact", false],
              ["Acil Telefon", "emergencyPhone", false],
            ] as const).map(([label, name, req]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input name={name} value={(form as Record<string, string | boolean>)[name] as string ?? ""} onChange={handleChange} required={req}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
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

      <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Kiracıyı Sil" size="sm">
        <p className="text-sm text-slate-600"><strong>{selected?.firstName} {selected?.lastName}</strong> kaydını silmek istediğinizden emin misiniz?</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
          <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
            {isPending ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
