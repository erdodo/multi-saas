import { auth } from "@/auth";
import { getCustomers } from "@/modules/randevu/actions/customer.actions";
import Link from "next/link";

interface SearchParams { search?: string; page?: string }

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const sp = await searchParams;

  const result = await getCustomers(tenantId, sp.search, Number(sp.page ?? 1));
  const { customers = [], pagination } = result.success
    ? result.data!
    : { customers: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 1 } };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-(--brand-text)">Müşteriler</h1>
        <p className="text-(--brand-text-muted) text-sm">{pagination?.total ?? 0} müşteri</p>
      </div>

      <form className="flex gap-3">
        <input name="search" type="search" defaultValue={sp.search}
          placeholder="İsim, e-posta veya telefon ara..."
          className="flex-1 border border-(--brand-border) bg-(--brand-surface) text-(--brand-text) rounded-lg px-3 py-2 text-sm ring-brand" />
        <button type="submit" className="btn-brand transition-colors">Ara</button>
      </form>

      <div className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--brand-surface-2) border-b border-(--brand-border)">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Müşteri</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Telefon</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Randevu</th>
              <th className="text-left px-4 py-3 font-medium text-(--brand-text-muted)">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-(--brand-text-muted)">Detay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--brand-border)">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-(--brand-text-muted)">
                  <div className="text-3xl mb-2">🤝</div>
                  <p>Müşteri bulunamadı</p>
                </td>
              </tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="hover:bg-(--brand-surface-2)">
                <td className="px-4 py-3">
                  <p className="font-medium text-(--brand-text)">{c.firstName} {c.lastName}</p>
                  {c.email && <p className="text-xs text-(--brand-text-muted)">{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-(--brand-text)">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-(--brand-text)">{c._count.appointments}</td>
                <td className="px-4 py-3">
                  {c.blacklisted ? (
                    <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">Engelli</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Aktif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-(--brand-text-muted)">#{c.id.slice(0, 8)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
