import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, Phone, Mail } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/login");
  const tenantId = session.user.tenantId;
  const sp = await searchParams;
  const search    = sp.search?.trim() ?? "";
  const page      = Math.max(1, Number(sp.page ?? 1));
  const pageSize  = 20;

  const where = {
    tenantId,
    ...(search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName:  { contains: search } },
            { email:     { contains: search } },
            { phone:     { contains: search } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
          <p className="text-slate-500 text-sm">{total} müşteri</p>
        </div>
      </div>

      {/* Arama */}
      <form className="flex gap-3">
        <input
          name="search"
          defaultValue={search}
          type="search"
          placeholder="İsim, e-posta veya telefon ara..."
          className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Ara
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Müşteri</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">İletişim</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>{search ? "Aramanızla eşleşen müşteri yok" : "Henüz müşteri eklenmemiş"}</p>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">
                      {c.firstName} {c.lastName}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      {c.email && (
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {c.email}
                        </p>
                      )}
                      {c.phone && (
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phone}
                        </p>
                      )}
                      {!c.email && !c.phone && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {format(c.createdAt, "d MMM yyyy", { locale: tr })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?search=${search}&page=${page - 1}`}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                ← Önceki
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?search=${search}&page=${page + 1}`}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Sonraki →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
