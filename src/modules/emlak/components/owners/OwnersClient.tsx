"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, UserRound, Pencil, Trash2, Phone, Mail, Building2 } from "lucide-react";
import { Modal } from "../shared/Modal";
import { createOwner, updateOwner, deleteOwner } from "@/modules/emlak/actions/owner.actions";

interface Owner {
  id: string; firstName: string; lastName: string; nationalId: string | null;
  phone: string | null; email: string | null; bankName: string | null; iban: string | null;
  notes: string | null; isActive: boolean;
  _count: { properties: number };
}

interface Props {
  tenantId:   string;
  tenantSlug: string;
  initialData: Owner[];
}

const EMPTY_FORM = {
  firstName: "", lastName: "", nationalId: "", taxNo: "", phone: "", phone2: "",
  email: "", address: "", bankName: "", iban: "", accountHolderName: "", notes: "", isActive: true,
};

export function OwnersClient({ tenantId, tenantSlug, initialData }: Props) {
  const router = useRouter();
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Owner | null>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [error, setError]       = useState("");
  const [isPending, startTr]    = useTransition();

  const filtered = initialData.filter(o =>
    !search || [o.firstName, o.lastName, o.phone, o.email]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(""); setModal("create"); }
  function openEdit(o: Owner) {
    setSelected(o);
    setForm({
      firstName: o.firstName, lastName: o.lastName, nationalId: o.nationalId ?? "",
      taxNo: "", phone: o.phone ?? "", phone2: "", email: o.email ?? "", address: "",
      bankName: o.bankName ?? "", iban: o.iban ?? "", accountHolderName: "",
      notes: o.notes ?? "", isActive: o.isActive,
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
        ? await createOwner(form, tenantId, tenantSlug)
        : await updateOwner(selected!.id, form, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(null); router.refresh();
    });
  }

  function handleDelete() {
    startTr(async () => {
      const res = await deleteOwner(selected!.id, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Silinemedi"); return; }
      setModal(null); router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mülk Sahipleri</h1>
          <p className="text-sm text-slate-500">{filtered.length} kayıt</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Sahip Ekle
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara..."
          className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 flex flex-col items-center gap-3">
          <UserRound className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">Henüz mülk sahibi eklenmemiş</p>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Sahip Ekle
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {filtered.map(o => (
            <div key={o.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 text-sm font-semibold">
                  {o.firstName[0]}{o.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{o.firstName} {o.lastName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {o.phone && <span className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3 h-3" />{o.phone}</span>}
                    {o.email && <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{o.email}</span>}
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Building2 className="w-3 h-3" />{o._count.properties} mülk</span>
                  </div>
                  {o.iban && <p className="text-xs text-slate-400 mt-0.5 font-mono">IBAN: {o.iban}</p>}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => openEdit(o)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { setSelected(o); setError(""); setModal("delete"); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal === "create" || modal === "edit"} onClose={() => setModal(null)}
        title={modal === "create" ? "Mülk Sahibi Ekle" : "Sahibi Düzenle"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ad *" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Field label="Soyad *" name="lastName" value={form.lastName} onChange={handleChange} required />
            <Field label="T.C. Kimlik No" name="nationalId" value={form.nationalId} onChange={handleChange} />
            <Field label="Vergi No" name="taxNo" value={form.taxNo} onChange={handleChange} />
            <Field label="Telefon" name="phone" value={form.phone} onChange={handleChange} />
            <Field label="Telefon 2" name="phone2" value={form.phone2} onChange={handleChange} />
            <Field label="E-posta" name="email" type="email" value={form.email} onChange={handleChange} className="col-span-2" />
            <Field label="Adres" name="address" value={form.address} onChange={handleChange} className="col-span-2" />
            <Field label="Banka Adı" name="bankName" value={form.bankName} onChange={handleChange} />
            <Field label="IBAN" name="iban" value={form.iban} onChange={handleChange} />
            <Field label="Hesap Sahibi Adı" name="accountHolderName" value={form.accountHolderName} onChange={handleChange} className="col-span-2" />
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

      <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Sahibi Sil" size="sm">
        <p className="text-sm text-slate-600"><strong>{selected?.firstName} {selected?.lastName}</strong> kaydını silmek istediğinize emin misiniz?</p>
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

function Field({ label, name, value, onChange, type = "text", required, className }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}
