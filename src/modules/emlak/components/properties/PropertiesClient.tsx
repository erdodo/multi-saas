"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Building2, Pencil, Trash2, MapPin, Home } from "lucide-react";
import { Modal } from "../shared/Modal";
import { StatusBadge } from "../shared/StatusBadge";
import {
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/modules/emlak/actions/property.actions";
import {
  PROPERTY_TYPES,
  PROPERTY_STATUS_LABELS,
  HEATING_TYPES,
  CURRENCIES,
} from "@/modules/emlak/utils/constants";

interface Owner { id: string; firstName: string; lastName: string }
interface Property {
  id: string; title: string; type: string; status: string;
  city: string | null; district: string | null; address: string | null;
  squareMeters: number | null; roomCount: string | null;
  owner: Owner | null;
  leases: Array<{ id: string; rentAmount: number; currency: string }>;
  photos: Array<{ url: string }>;
}

interface Props {
  tenantId:    string;
  tenantSlug:  string;
  initialData: { items: Property[]; total: number; page: number; limit: number };
  owners:      Owner[];
}

const EMPTY_FORM = {
  title: "", type: "APARTMENT", status: "AVAILABLE", ownerId: "",
  city: "", district: "", neighborhood: "", address: "", postalCode: "",
  squareMeters: "", roomCount: "", floorNumber: "", totalFloors: "",
  hasElevator: false, isFurnished: false, hasParking: false, hasBalcony: false,
  buildingAge: "", heatingType: "", notes: "", purchasePrice: "",
  purchaseCurrency: "TRY", purchaseDate: "", marketValue: "", isActive: true,
};

export function PropertiesClient({ tenantId, tenantSlug, initialData, owners }: Props) {
  const router  = useRouter();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<{ status?: string; type?: string }>({});
  const [modal, setModal]     = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Property | null>(null);
  const [form, setForm]       = useState({ ...EMPTY_FORM });
  const [error, setError]     = useState("");
  const [isPending, startTr]  = useTransition();

  const items = initialData.items;

  const filtered = items.filter((p) => {
    const matchSearch = !search || [p.title, p.address, p.city, p.district]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !filter.status || p.status === filter.status;
    const matchType   = !filter.type   || p.type   === filter.type;
    return matchSearch && matchStatus && matchType;
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setError("");
    setModal("create");
  }

  function openEdit(p: Property) {
    setSelected(p);
    setForm({
      title: p.title, type: p.type, status: p.status, ownerId: p.owner?.id ?? "",
      city: p.city ?? "", district: p.district ?? "", neighborhood: "", address: p.address ?? "",
      postalCode: "", squareMeters: p.squareMeters?.toString() ?? "",
      roomCount: p.roomCount ?? "", floorNumber: "", totalFloors: "",
      hasElevator: false, isFurnished: false, hasParking: false, hasBalcony: false,
      buildingAge: "", heatingType: "", notes: "", purchasePrice: "",
      purchaseCurrency: "TRY", purchaseDate: "", marketValue: "", isActive: true,
    });
    setError("");
    setModal("edit");
  }

  function openDelete(p: Property) {
    setSelected(p);
    setModal("delete");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTr(async () => {
      const data = {
        ...form,
        ownerId:      form.ownerId      || undefined,
        squareMeters: form.squareMeters ? Number(form.squareMeters) : undefined,
        floorNumber:  form.floorNumber  ? Number(form.floorNumber)  : undefined,
        totalFloors:  form.totalFloors  ? Number(form.totalFloors)  : undefined,
        buildingAge:  form.buildingAge  ? Number(form.buildingAge)  : undefined,
        purchasePrice:form.purchasePrice? Number(form.purchasePrice): undefined,
        marketValue:  form.marketValue  ? Number(form.marketValue)  : undefined,
        purchaseDate: form.purchaseDate || undefined,
        heatingType:  form.heatingType  || undefined,
        type:    form.type as "APARTMENT"|"HOUSE"|"LAND"|"SHOP"|"OFFICE"|"OTHER",
        status:  form.status as "AVAILABLE"|"RENTED"|"FOR_SALE"|"SOLD"|"MAINTENANCE",
      };

      const res = modal === "create"
        ? await createProperty(data, tenantId, tenantSlug)
        : await updateProperty(selected!.id, data, tenantId, tenantSlug);

      if (!res.success) { setError(res.error ?? "Hata oluştu"); return; }
      setModal(null);
      router.refresh();
    });
  }

  function handleDelete() {
    startTr(async () => {
      const res = await deleteProperty(selected!.id, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Silinemedi"); return; }
      setModal(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mülklerim</h1>
          <p className="text-sm text-slate-500">{filtered.length} mülk</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Mülk Ekle
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Mülk ara..."
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter.status ?? ""}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value || undefined }))}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filter.type ?? ""}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value || undefined }))}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Türler</option>
          {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              onEdit={() => openEdit(p)}
              onDelete={() => openDelete(p)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modal === "create" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Yeni Mülk Ekle" : "Mülkü Düzenle"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Başlık / İsim <span className="text-red-500">*</span>
              </label>
              <input
                name="title" required value={form.title} onChange={handleChange}
                placeholder="Örn: Kadıköy 2+1 Daire"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mülk Sahibi</label>
              <select name="ownerId" value={form.ownerId} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
              <input name="city" value={form.city} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
              <input name="district" value={form.district} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mahalle</label>
              <input name="neighborhood" value={form.neighborhood} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tam Adres</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">m²</label>
              <input name="squareMeters" type="number" min="0" step="0.01" value={form.squareMeters} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Oda Sayısı</label>
              <input name="roomCount" value={form.roomCount} onChange={handleChange}
                placeholder="2+1, 3+1..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bulunduğu Kat</label>
              <input name="floorNumber" type="number" value={form.floorNumber} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Toplam Kat</label>
              <input name="totalFloors" type="number" min="1" value={form.totalFloors} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Isıtma</label>
              <select name="heatingType" value={form.heatingType} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçiniz</option>
                {Object.entries(HEATING_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bina Yaşı</label>
              <input name="buildingAge" type="number" min="0" value={form.buildingAge} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                ["hasElevator", "Asansör"],
                ["isFurnished", "Eşyalı"],
                ["hasParking",  "Otopark"],
                ["hasBalcony",  "Balkon"],
              ] as const).map(([name, label]) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name] as boolean}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alış Fiyatı</label>
              <div className="flex gap-2">
                <input name="purchasePrice" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={handleChange}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="purchaseCurrency" value={form.purchaseCurrency} onChange={handleChange}
                  className="w-20 px-2 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.keys(CURRENCIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Güncel Değer</label>
              <input name="marketValue" type="number" min="0" step="0.01" value={form.marketValue} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alış Tarihi</label>
              <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              İptal
            </button>
            <button type="submit" disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
              {isPending ? "Kaydediliyor..." : modal === "create" ? "Mülkü Ekle" : "Kaydet"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={modal === "delete"} onClose={() => setModal(null)} title="Mülkü Sil" size="sm">
        <p className="text-sm text-slate-600">
          <strong>{selected?.title}</strong> adlı mülkü silmek istediğinizden emin misiniz?
          Bu işlem geri alınamaz.
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setModal(null)}
            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            İptal
          </button>
          <button onClick={handleDelete} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors">
            {isPending ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ property: p, onEdit, onDelete }: {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const activeRent = p.leases[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors group">
      {/* Image placeholder */}
      <div className="h-36 bg-slate-100 flex items-center justify-center relative overflow-hidden">
        {p.photos[0]?.url
          ? <img src={p.photos[0].url} alt={p.title} className="w-full h-full object-cover" />
          : <Building2 className="w-10 h-10 text-slate-300" />
        }
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit}
            className="p-1.5 bg-white rounded-lg shadow text-slate-600 hover:text-blue-600 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 bg-white rounded-lg shadow text-slate-600 hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{p.title}</h3>
            <p className="text-xs text-slate-400">{PROPERTY_TYPES[p.type]}</p>
          </div>
          <StatusBadge status={p.status} variant="property" />
        </div>

        {(p.city || p.address) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{[p.district, p.city].filter(Boolean).join(", ") || p.address}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {p.squareMeters && <span>{p.squareMeters} m²</span>}
          {p.roomCount    && <span><Home className="w-3 h-3 inline mr-0.5" />{p.roomCount}</span>}
          {p.owner        && <span className="truncate">{p.owner.firstName} {p.owner.lastName}</span>}
        </div>

        {activeRent && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm font-semibold text-emerald-600">
              {activeRent.currency === "TRY" ? "₺" : activeRent.currency}
              {activeRent.rentAmount.toLocaleString("tr-TR")}
              <span className="font-normal text-slate-400">/ay</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
        <Building2 className="w-7 h-7 text-slate-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900">Henüz mülk eklenmemiş</p>
        <p className="text-sm text-slate-500 mt-1">İlk mülkünüzü ekleyerek başlayın</p>
      </div>
      <button onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Mülk Ekle
      </button>
    </div>
  );
}
