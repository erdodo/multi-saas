import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/modules/emlak/actions/dashboard.actions";
import {
  Building2,
  Home,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function EmlakDashboardPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  });
  if (!tenant) redirect("/setup");

  const result = await getDashboardStats(tenant.id);
  const stats = result.success ? result.data! : null;

  const base = `/${tenantSlug}/emlak-panel/dashboard`;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Genel Bakış</h1>
        <p className="text-sm text-slate-500 mt-1">
          {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Toplam Mülk"
          value={stats?.totalProperties ?? 0}
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          sub={`${stats?.rentedProperties ?? 0} kirada · ${stats?.availableProperties ?? 0} boş`}
        />
        <StatCard
          label="Aktif Sözleşme"
          value={stats?.activeLeases ?? 0}
          icon={<FileText className="w-5 h-5" />}
          color="violet"
          href={`${base}/leases`}
        />
        <StatCard
          label="Bu Ay Beklenen"
          value={`₺${(stats?.thisMonthExpected ?? 0).toLocaleString("tr-TR")}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
          sub={`₺${(stats?.thisMonthCollected ?? 0).toLocaleString("tr-TR")} tahsil edildi`}
        />
        <StatCard
          label="Gecikmiş Ödeme"
          value={stats?.overdueCount ?? 0}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
          sub={
            stats?.overdueTotal
              ? `₺${stats.overdueTotal.toLocaleString("tr-TR")}`
              : undefined
          }
          href={`${base}/payments?status=OVERDUE`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gecikmiş Ödemeler */}
        <Section
          title="Gecikmiş Ödemeler"
          icon={<AlertCircle className="w-4 h-4 text-red-500" />}
          href={`${base}/payments?status=OVERDUE`}
          linkLabel="Tümünü Gör"
          empty={!stats?.overduePayments?.length}
          emptyText="Gecikmiş ödeme bulunmuyor 🎉"
        >
          <div className="divide-y divide-slate-100">
            {stats?.overduePayments?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 px-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {p.lease.property.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.lease.propertyTenant.firstName}{" "}
                    {p.lease.propertyTenant.lastName} ·{" "}
                    {format(new Date(p.dueDate), "d MMM yyyy", { locale: tr })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-red-600 ml-3 flex-shrink-0">
                  ₺{p.amount.toLocaleString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Yaklaşan Sözleşme Bitimleri */}
        <Section
          title="Yaklaşan Sözleşme Bitimleri"
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          href={`${base}/leases`}
          linkLabel="Tümünü Gör"
          empty={!stats?.expiringLeases?.length}
          emptyText="60 gün içinde biten sözleşme yok"
        >
          <div className="divide-y divide-slate-100">
            {stats?.expiringLeases?.map((l) => {
              const daysLeft = Math.ceil(
                (new Date(l.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between py-3 px-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {l.property.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {l.propertyTenant.firstName} {l.propertyTenant.lastName} ·{" "}
                      {format(new Date(l.endDate), "d MMM yyyy", {
                        locale: tr,
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ml-3 flex-shrink-0 ${
                      daysLeft <= 14
                        ? "bg-red-100 text-red-700"
                        : daysLeft <= 30
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[var(--brand-primary,#3b82f6)] bg-opacity-10 text-[var(--brand-primary,#1d4ed8)]"
                    }`}
                  >
                    {daysLeft} gün
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Son Tahsilat */}
        <Section
          title="Son Tahsilatlar"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          href={`${base}/payments?status=PAID`}
          linkLabel="Tümünü Gör"
          empty={!stats?.recentPayments?.length}
          emptyText="Henüz ödeme kaydı yok"
        >
          <div className="divide-y divide-slate-100">
            {stats?.recentPayments?.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 px-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {p.lease.property.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.paidAt
                      ? format(new Date(p.paidAt), "d MMM yyyy", { locale: tr })
                      : "—"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 ml-3 flex-shrink-0">
                  ₺{(p.paidAmount ?? p.amount).toLocaleString("tr-TR")}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Hızlı Erişim */}
        <div className="bg-white rounded-[var(--brand-radius,12px)] border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Mülk Ekle",
                href: `${base}/properties`,
                icon: Building2,
              },
              { label: "Kiracı Ekle", href: `${base}/tenants`, icon: Home },
              {
                label: "Sözleşme Ekle",
                href: `${base}/leases`,
                icon: FileText,
              },
              {
                label: "Ödeme Kaydet",
                href: `${base}/payments`,
                icon: DollarSign,
              },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 p-3 rounded-[var(--brand-radius,8px)] border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Alt bileşenler ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "violet" | "emerald" | "red";
  sub?: string;
  href?: string;
}) {
  const colors = {
    blue: "bg-[var(--brand-primary,#3b82f6)] bg-opacity-10 text-[var(--brand-primary,#2563eb)]",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  const card = (
    <div className="bg-white rounded-[var(--brand-radius,12px)] border border-slate-200 p-5 space-y-3 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={`w-9 h-9 rounded-[var(--brand-radius,8px)] flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function Section({
  title,
  icon,
  href,
  linkLabel,
  empty,
  emptyText,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  linkLabel: string;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[var(--brand-radius,12px)] border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Link
          href={href}
          className="text-xs text-[var(--brand-primary,#2563eb)] hover:opacity-80 font-medium"
        >
          {linkLabel}
        </Link>
      </div>
      {empty ? (
        <div className="py-10 text-center text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
