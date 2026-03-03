import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AppointmentsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Randevular</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Tarih / Saat</th>
              <th className="px-6 py-4">Müşteri</th>
              <th className="px-6 py-4">Uzman / Hizmet</th>
              <th className="px-6 py-4">Durum</th>
              <th className="px-6 py-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            <tr>
              <td
                colSpan={5}
                className="px-6 py-8 text-center text-neutral-500"
              >
                Henüz randevu bulunmuyor
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
