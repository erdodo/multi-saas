import { auth } from "@/auth";
import { getStaff } from "@/modules/randevu/actions/staff.actions";
import Link from "next/link";
import { DAY_SHORT_NAMES } from "@/modules/randevu/utils/constants";

export default async function StaffPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const session = await auth();
  const tenantId = session!.user.tenantId;
  const { tenantSlug } = await params;

  const result = await getStaff(tenantId);
  const staffList = result.success ? result.data! : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--brand-text)">Personel</h1>
          <p className="text-(--brand-text-muted) text-sm">{staffList.length} personel</p>
        </div>
        <Link href={`/${tenantSlug}/randevu-panel/dashboard/staff/new`} className="btn-brand transition-colors">
          + Yeni Personel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-(--brand-text-muted) bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border)">
            <div className="text-4xl mb-2">👥</div>
            <p>Henüz personel eklenmemiş</p>
            <Link href={`/${tenantSlug}/randevu-panel/dashboard/staff/new`}
              className="mt-3 inline-block text-brand hover:underline text-sm">
              İlk personeli ekle →
            </Link>
          </div>
        ) : staffList.map((staff) => (
          <div key={staff.id} className="bg-(--brand-surface) rounded-(--brand-card-radius) border border-(--brand-border) p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{ background: staff.color ?? "#3b82f6" }}>
                {staff.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-(--brand-text)">{staff.name}</h3>
                <p className="text-xs text-(--brand-text-muted)">{(staff as any)._count?.appointments ?? 0} randevu</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                staff.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {staff.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-(--brand-text-muted) mb-1.5">HİZMETLER</p>
              <div className="flex flex-wrap gap-1">
                {(staff as any).staffServices?.map((ss: any) => (
                  <span key={ss.service.id} className="text-xs badge-brand rounded-full px-2 py-0.5">
                    {ss.service.name}
                  </span>
                ))}
              </div>
            </div>

            {(staff as any).availabilityRules?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-(--brand-text-muted) mb-1.5">ÇALIŞMA GÜNLERİ</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const hasRule = (staff as any).availabilityRules?.some((r: any) => r.dayOfWeek === day);
                    return (
                      <span key={day} className={`text-xs w-8 text-center py-0.5 rounded ${
                        hasRule ? "badge-brand font-medium" : "bg-(--brand-surface-2) text-(--brand-text-muted)"
                      }`}>
                        {DAY_SHORT_NAMES[day - 1]}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <Link href={`/${tenantSlug}/randevu-panel/dashboard/staff/${staff.id}`}
              className="block text-center text-sm text-brand hover:underline pt-1">
              Düzenle →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
