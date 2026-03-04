"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle } from "lucide-react";
import { Modal } from "../shared/Modal";
import { StatusBadge } from "../shared/StatusBadge";
import { markPaymentPaid } from "@/modules/emlak/actions/payment.actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Payment {
  id: string; status: string; dueDate: Date; amount: number;
  paidAmount: number | null; paidAt: Date | null;
  paymentMethod: string | null; receiptNo: string | null;
  notes: string | null; currency: string;
  lease: {
    id: string;
    property: { id: string; title: string };
    propertyTenant: { id: string; firstName: string; lastName: string };
  };
}

interface Props {
  tenantId:    string;
  tenantSlug:  string;
  initialData: Payment[];
}

const EMPTY_FORM = {
  paidAmount: "", paidAt: new Date().toISOString().split("T")[0],
  paymentMethod: "CASH", receiptNo: "", notes: "",
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: "Tümü", PENDING: "Bekleyen", PAID: "Ödendi", OVERDUE: "Gecikmiş", PARTIAL: "Kısmi",
};

export function PaymentsClient({ tenantId, tenantSlug, initialData }: Props) {
  const router = useRouter();
  const [filter, setFilter]     = useState("ALL");
  const [modal, setModal]       = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [error, setError]       = useState("");
  const [isPending, startTr]    = useTransition();

  const filtered = filter === "ALL" ? initialData : initialData.filter(p => p.status === filter);

  // Group by month
  const groups: Record<string, Payment[]> = {};
  filtered.forEach(p => {
    const key = format(new Date(p.dueDate), "MMMM yyyy", { locale: tr });
    groups[key] = groups[key] ? [...groups[key], p] : [p];
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleMarkPaid(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!selected) return;
    startTr(async () => {
      const res = await markPaymentPaid({
        paymentId: selected.id,
        paidAmount: form.paidAmount ? Number(form.paidAmount) : selected.amount,
        paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : new Date().toISOString(),
        paymentMethod: form.paymentMethod || undefined,
        receiptNo: form.receiptNo || undefined,
        notes: form.notes || undefined,
      }, tenantId, tenantSlug);
      if (!res.success) { setError(res.error ?? "Hata"); return; }
      setModal(false); router.refresh();
    });
  }

  const summaryPending = initialData.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const summaryOverdue = initialData.filter(p => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0);
  const summaryPaid    = initialData.filter(p => p.status === "PAID").reduce((s, p) => s + (p.paidAmount ?? p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ödemeler</h1>
        <p className="text-sm text-slate-500">Kira ödeme takip sistemi</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Bekleyen</p>
          <p className="text-xl font-bold text-amber-700 mt-1">₺{summaryPending.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Gecikmiş</p>
          <p className="text-xl font-bold text-red-700 mt-1">₺{summaryOverdue.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Tahsil Edilen</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">₺{summaryPaid.toLocaleString("tr-TR")}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {Object.entries(STATUS_FILTER_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === k ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {v}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-14 flex flex-col items-center gap-3">
          <CreditCard className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500">Ödeme bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([month, payments]) => (
            <div key={month} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 capitalize">{month}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toplam ₺{payments.reduce((s, p) => s + p.amount, 0).toLocaleString("tr-TR")} ·{" "}
                  Tahsil ₺{payments.filter(p => ["PAID","PARTIAL"].includes(p.status)).reduce((s, p) => s + (p.paidAmount ?? 0), 0).toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {payments.map(p => (
                  <div key={p.id} className={`px-5 py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50 ${p.status === "OVERDUE" ? "bg-red-50/40" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800 truncate">{p.lease.property.title}</p>
                        <StatusBadge status={p.status} variant="payment" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.lease.propertyTenant.firstName} {p.lease.propertyTenant.lastName}
                        <span className="mx-1.5">·</span>
                        Vade: {format(new Date(p.dueDate), "d MMM", { locale: tr })}
                        {p.paidAt && <span className="ml-2 text-emerald-600">· Ödendi: {format(new Date(p.paidAt), "d MMM", { locale: tr })}</span>}
                        {p.receiptNo && <span className="ml-2 text-slate-400">· #{p.receiptNo}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">₺{p.amount.toLocaleString("tr-TR")}</p>
                        {p.paidAmount != null && p.paidAmount !== p.amount && (
                          <p className="text-xs text-emerald-600">Ödenen: ₺{p.paidAmount.toLocaleString("tr-TR")}</p>
                        )}
                      </div>
                      {(p.status === "PENDING" || p.status === "OVERDUE" || p.status === "PARTIAL") && (
                        <button onClick={() => openModal(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors opacity-0 group-hover:opacity-100">
                          <CheckCircle className="w-3.5 h-3.5" /> Ödendi İşaretle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark Paid Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Ödeme Kaydet" size="sm">
        <form onSubmit={handleMarkPaid} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {selected && (
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <p className="font-medium text-slate-800">{selected.lease.property.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Tutar: ₺{selected.amount.toLocaleString("tr-TR")} ·
                Vade: {format(new Date(selected.dueDate), "d MMM yyyy", { locale: tr })}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ödenen Tutar (boş bırakılırsa tam ödeme)</label>
            <input type="number" name="paidAmount" value={form.paidAmount} onChange={handleChange}
              placeholder={selected ? String(selected.amount) : ""} min="0" step="0.01"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Tarihi</label>
            <input type="date" name="paidAt" value={form.paidAt} onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Yöntemi</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[["CASH","Nakit"],["BANK_TRANSFER","Havale/EFT"],["CREDIT_CARD","Kredi Kartı"],["CHECK","Çek"]].map(([k, v]) =>
                <option key={k} value={k}>{v}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Makbuz / Dekont No</label>
            <input name="receiptNo" value={form.receiptNo} onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Not</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">İptal</button>
            <button type="submit" disabled={isPending} className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">
              {isPending ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );

  function openModal(p: Payment) {
    setSelected(p);
    setForm({ ...EMPTY_FORM, paidAmount: String(p.amount) });
    setError("");
    setModal(true);
  }
}
