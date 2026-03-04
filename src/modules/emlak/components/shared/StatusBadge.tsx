import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  LEASE_STATUS_LABELS,
  LEASE_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/modules/emlak/utils/constants";

type BadgeVariant = "property" | "lease" | "payment";

interface Props {
  status:  string;
  variant: BadgeVariant;
}

export function StatusBadge({ status, variant }: Props) {
  const labels: Record<BadgeVariant, Record<string, string>> = {
    property: PROPERTY_STATUS_LABELS,
    lease:    LEASE_STATUS_LABELS,
    payment:  PAYMENT_STATUS_LABELS,
  };
  const colors: Record<BadgeVariant, Record<string, string>> = {
    property: PROPERTY_STATUS_COLORS,
    lease:    LEASE_STATUS_COLORS,
    payment:  PAYMENT_STATUS_COLORS,
  };

  const label = labels[variant][status] ?? status;
  const color = colors[variant][status] ?? "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
