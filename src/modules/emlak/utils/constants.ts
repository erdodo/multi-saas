// ─── Emlak Türleri ──────────────────────────────────────────────────────────
export const PROPERTY_TYPES: Record<string, string> = {
  APARTMENT: "Daire",
  HOUSE:     "Müstakil Ev",
  LAND:      "Arsa",
  SHOP:      "Dükkan",
  OFFICE:    "Ofis",
  OTHER:     "Diğer",
};

// ─── Emlak Durumları ────────────────────────────────────────────────────────
export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE:   "Boş",
  RENTED:      "Kirada",
  FOR_SALE:    "Satılık",
  SOLD:        "Satıldı",
  MAINTENANCE: "Bakımda",
};

export const PROPERTY_STATUS_COLORS: Record<string, string> = {
  AVAILABLE:   "bg-emerald-100 text-emerald-700",
  RENTED:      "bg-blue-100 text-blue-700",
  FOR_SALE:    "bg-amber-100 text-amber-700",
  SOLD:        "bg-slate-100 text-slate-600",
  MAINTENANCE: "bg-orange-100 text-orange-700",
};

// ─── Kira Sözleşmesi Durumları ──────────────────────────────────────────────
export const LEASE_STATUS_LABELS: Record<string, string> = {
  ACTIVE:      "Aktif",
  ENDED:       "Sona Erdi",
  TERMINATED:  "Feshedildi",
};

export const LEASE_STATUS_COLORS: Record<string, string> = {
  ACTIVE:     "bg-emerald-100 text-emerald-700",
  ENDED:      "bg-slate-100 text-slate-600",
  TERMINATED: "bg-red-100 text-red-700",
};

// ─── Ödeme Durumları ────────────────────────────────────────────────────────
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING:  "Bekliyor",
  PAID:     "Ödendi",
  OVERDUE:  "Gecikmiş",
  PARTIAL:  "Kısmi Ödeme",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID:    "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  PARTIAL: "bg-blue-100 text-blue-700",
};

// ─── Abonelik Türleri ───────────────────────────────────────────────────────
export const SUBSCRIPTION_TYPES: Record<string, string> = {
  ELECTRICITY: "Elektrik",
  NATURAL_GAS: "Doğalgaz",
  WATER:       "Su",
  INTERNET:    "İnternet",
  PHONE:       "Telefon",
  CABLE_TV:    "Kablo TV",
  OTHER:       "Diğer",
};

// ─── Belge Türleri ──────────────────────────────────────────────────────────
export const DOCUMENT_TYPES: Record<string, string> = {
  DEED:      "Tapu",
  CONTRACT:  "Kira Sözleşmesi",
  INSURANCE: "Sigorta",
  INVOICE:   "Fatura",
  PERMIT:    "Ruhsat / İzin",
  TAX:       "Vergi Belgesi",
  OTHER:     "Diğer",
};

// ─── Isıtma Türleri ─────────────────────────────────────────────────────────
export const HEATING_TYPES: Record<string, string> = {
  CENTRAL:    "Merkezi",
  INDIVIDUAL: "Bireysel",
  FLOOR:      "Yerden",
  STOVE:      "Soba",
  NONE:       "Yok",
};

// ─── Ödeme Yöntemleri ───────────────────────────────────────────────────────
export const PAYMENT_METHODS: Record<string, string> = {
  CASH:          "Nakit",
  BANK_TRANSFER: "Banka Transferi",
  CHECK:         "Çek",
  OTHER:         "Diğer",
};

// ─── Para Birimleri ─────────────────────────────────────────────────────────
export const CURRENCIES: Record<string, string> = {
  TRY: "₺ Türk Lirası",
  USD: "$ Dolar",
  EUR: "€ Euro",
  GBP: "£ Sterlin",
};
