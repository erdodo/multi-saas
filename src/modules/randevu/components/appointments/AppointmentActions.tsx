"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  updateAppointmentStatus,
  cancelAppointment,
} from "@/modules/randevu/actions/appointment.actions";

interface Props {
  appointmentId: string;
  status: string;
  tenantId: string;
}

export default function AppointmentActions({
  appointmentId,
  status,
  tenantId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (
    action: "confirm" | "cancel" | "complete" | "no_show",
  ) => {
    setLoading(true);
    try {
      let result;
      if (action === "cancel") {
        result = await cancelAppointment({ appointmentId }, tenantId);
      } else {
        const statusMap: Record<string, string> = {
          confirm: "CONFIRMED",
          complete: "COMPLETED",
          no_show: "NO_SHOW",
        };
        result = await updateAppointmentStatus(
          { appointmentId, status: statusMap[action] },
          tenantId,
        );
      }
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Randevu güncellendi");
      }
    } finally {
      setLoading(false);
    }
  };

  if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(status)) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      {status === "PENDING" && (
        <button
          onClick={() => handleAction("confirm")}
          disabled={loading}
          className="inline-flex items-center gap-1 text-xs bg-[var(--brand-primary,#3b82f6)] text-white hover:opacity-90 px-2.5 py-1 rounded-[var(--brand-radius,6px)] transition-opacity disabled:opacity-50 font-medium"
        >
          <Check className="w-3 h-3" />
          Onayla
        </button>
      )}
      {(status === "PENDING" || status === "CONFIRMED") && (
        <>
          <button
            onClick={() => handleAction("complete")}
            disabled={loading}
            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded-[var(--brand-radius,6px)] transition-colors disabled:opacity-50"
          >
            Tamamla
          </button>
          <button
            onClick={() => handleAction("no_show")}
            disabled={loading}
            className="text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-[var(--brand-radius,6px)] transition-colors disabled:opacity-50"
          >
            Gelmedi
          </button>
          <button
            onClick={() => handleAction("cancel")}
            disabled={loading}
            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-[var(--brand-radius,6px)] transition-colors disabled:opacity-50"
          >
            İptal
          </button>
        </>
      )}
    </div>
  );
}
