import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import QRCode from "qrcode";
import { getAppointmentById } from "@/modules/randevu/actions/appointment.actions";
import ShareButton from "./ShareButton";

interface Params {
  params: Promise<{ tenantSlug: string; appointmentId: string }>;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    PENDING: {
      label: "Onay Bekliyor",
      color: "text-yellow-700",
      bg: "bg-yellow-50 border-yellow-200",
    },
    CONFIRMED: {
      label: "Onaylandı",
      color: "text-green-700",
      bg: "bg-green-50 border-green-200",
    },
    CANCELLED: {
      label: "İptal Edildi",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
    },
    COMPLETED: {
      label: "Tamamlandı",
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    },
    NO_SHOW: {
      label: "Gelişmedi",
      color: "text-gray-700",
      bg: "bg-gray-50 border-gray-200",
    },
    RESCHEDULED: {
      label: "Yeniden Planlandı",
      color: "text-purple-700",
      bg: "bg-purple-50 border-purple-200",
    },
  };

export default async function AppointmentConfirmPage({ params }: Params) {
  const { tenantSlug, appointmentId } = await params;
  const result = await getAppointmentById(appointmentId, tenantSlug);
  if (!result.success || !result.data) notFound();

  const appt = result.data;
  const status = STATUS_MAP[appt.status] ?? STATUS_MAP["PENDING"];

  // QR kodu → bu URL
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${tenantSlug}/randevu-panel/book/${appointmentId}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 2,
    color: { dark: "#1e3a5f", light: "#ffffff" },
  });

  const displayName =
    appt.guestName ??
    (appt.customer
      ? `${appt.customer.firstName} ${appt.customer.lastName}`
      : "Misafir");
  const startAt = appt.startAt ? new Date(appt.startAt) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Colored header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-14 text-center text-white">
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold">Randevunuz Oluşturuldu!</h1>
            <p className="text-blue-100 text-sm mt-1">
              Aşağıdaki detayları saklayın
            </p>
          </div>

          {/* Card body — negative margin to overlap header */}
          <div className="-mt-8 mx-4 bg-white rounded-xl shadow-lg p-5 space-y-3">
            {/* Status badge */}
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}
            >
              {appt.status === "CONFIRMED"
                ? "✅"
                : appt.status === "PENDING"
                  ? "⏳"
                  : "ℹ️"}{" "}
              {status.label}
            </div>

            <Row
              label="Randevu No"
              value={appt.id.slice(0, 8).toUpperCase()}
              mono
            />
            <Row label="Hizmet" value={appt.service.name} />
            <Row label="Uzman" value={appt.staff.name} />
            {startAt && (
              <Row
                label="Tarih & Saat"
                value={`${format(startAt, "d MMMM yyyy EEEE", { locale: tr })} — ${format(startAt, "HH:mm")}`}
              />
            )}
            <Row label="Ad Soyad" value={displayName} />
            {appt.location && <Row label="Konum" value={appt.location.name} />}
            {appt.notes && <Row label="Notlar" value={appt.notes} />}
          </div>

          <div className="px-5 pb-6 pt-4 space-y-4">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Randevu QR Kodu"
                className="w-36 h-36 rounded-xl shadow-md"
              />
              <p className="text-xs text-gray-400 text-center">
                QR kodu tarayarak randevunuzu sorgulayabilirsiniz
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <ShareButton
                url={qrUrl}
                title="Randevum"
                text={`${appt.service.name} randevum: ${startAt ? format(startAt, "d MMMM yyyy HH:mm", { locale: tr }) : ""}`}
              />
              <a
                href={qrDataUrl}
                download={`randevu-${appt.id.slice(0, 8)}.png`}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                📥 QR İndir
              </a>
            </div>

            <a
              href={`/${tenantSlug}/randevu-panel/book`}
              className="block text-center text-sm text-blue-600 hover:underline pt-1"
            >
              ← Yeni randevu al
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-1 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0 w-24">{label}</span>
      <span
        className={`text-sm font-medium text-gray-900 text-right ${mono ? "font-mono tracking-wide" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
