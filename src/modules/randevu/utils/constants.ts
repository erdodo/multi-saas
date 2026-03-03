// ─── Randevu Durumları ────────────────────────────────────────────────────────
export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING:     "Bekliyor",
  CONFIRMED:   "Onaylandı",
  CANCELLED:   "İptal",
  RESCHEDULED: "Ertelendi",
  COMPLETED:   "Tamamlandı",
  NO_SHOW:     "Gelmedi",
};

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  PENDING:     "bg-yellow-100 text-yellow-800",
  CONFIRMED:   "bg-blue-100 text-blue-800",
  CANCELLED:   "bg-red-100 text-red-800",
  RESCHEDULED: "bg-purple-100 text-purple-800",
  COMPLETED:   "bg-green-100 text-green-800",
  NO_SHOW:     "bg-gray-100 text-gray-800",
};

// ─── Haftanın günleri ─────────────────────────────────────────────────────────
export const DAY_NAMES: Record<number, string> = {
  0: "Pazar",
  1: "Pazartesi",
  2: "Salı",
  3: "Çarşamba",
  4: "Perşembe",
  5: "Cuma",
  6: "Cumartesi",
};

export const DAY_SHORT_NAMES: Record<number, string> = {
  0: "Paz",
  1: "Pzt",
  2: "Sal",
  3: "Çar",
  4: "Per",
  5: "Cum",
  6: "Cmt",
};

// ─── Para birimleri ───────────────────────────────────────────────────────────
export const CURRENCIES = [
  { label: "Türk Lirası (₺)", value: "TRY" },
  { label: "Euro (€)",        value: "EUR" },
  { label: "Dolar ($)",       value: "USD" },
  { label: "Sterlin (£)",     value: "GBP" },
];
