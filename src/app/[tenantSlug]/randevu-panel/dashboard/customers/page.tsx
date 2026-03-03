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
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <p className="text-gray-500 text-sm">{pagination?.total ?? 0} müşteri</p>
      </div>

      <form className="flex gap-3">
        <input name="search" type="search" defaultValue={sp.search}
          placeholder="İsim, e-posta veya telefon ara..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm ring-brand" />
        <button type="submit" className="btn-brand transition-colors">Ara</button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Müşteri</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Telefon</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Randevu</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Detay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  <div className="text-3xl mb-2">🤝</div>
                  <p>Müşteri bulunamadı</p>
                </td>
              </tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                  {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-gray-700">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{c._count.appointments}</td>
                <td className="px-4 py-3">
                  {c.blacklisted ? (
                    <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">Engelli</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Aktif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-gray-400">#{c.id.slice(0, 8)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
