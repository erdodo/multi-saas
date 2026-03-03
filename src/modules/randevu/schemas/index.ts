import { z } from "zod";

// ─── Service ──────────────────────────────────────────────────────────────────
export const createServiceSchema = z.object({
  name:         z.string().min(2, "Hizmet adı en az 2 karakter olmalıdır"),
  description:  z.string().optional(),
  duration:     z.coerce.number().min(5, "Süre en az 5 dakika olmalıdır").max(480),
  bufferTime:   z.coerce.number().min(0).max(120).default(0),
  price:        z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  currency:     z.string().length(3).default("TRY"),
  color:        z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli bir renk kodu girin").optional(),
  isActive:     z.boolean().default(true),
  maxCapacity:  z.coerce.number().min(1).max(100).default(1),
});

export const updateServiceSchema = createServiceSchema.partial();
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// ─── Staff ────────────────────────────────────────────────────────────────────
export const createStaffSchema = z.object({
  name:        z.string().min(2, "Personel adı en az 2 karakter olmalıdır"),
  email:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().email("Geçerli e-posta giriniz").optional()),
  password:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional()),
  phone:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  bio:         z.string().optional(),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  isActive:    z.boolean().default(true),
  serviceIds:  z.array(z.string().uuid()).min(1, "En az bir hizmet seçilmelidir"),
  locationId:  z.string().uuid().optional(),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(7),
    startTime: z.string(),
    endTime:   z.string(),
    isActive:  z.boolean().default(true),
  })).optional(),
});

export const updateStaffSchema = createStaffSchema.partial();
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

// ─── Availability Rule ────────────────────────────────────────────────────────
const timeRegex = /^([0-1]?\d|2[0-3]):[0-5]\d$/;

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Geçerli saat formatı: HH:mm"),
  endTime:   z.string().regex(timeRegex, "Geçerli saat formatı: HH:mm"),
  isActive:  z.boolean().default(true),
}).refine(
  (d) => d.startTime < d.endTime,
  { message: "Başlangıç saati bitiş saatinden önce olmalıdır", path: ["endTime"] }
);

export const setAvailabilitySchema = z.object({
  staffId: z.string().uuid(),
  rules:   z.array(availabilityRuleSchema),
});

export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;
export type SetAvailabilityInput  = z.infer<typeof setAvailabilitySchema>;

// ─── TimeOff ──────────────────────────────────────────────────────────────────
export const createTimeOffSchema = z.object({
  staffId: z.string().uuid(),
  startAt: z.string().datetime({ message: "Geçerli tarih-saat girin" }),
  endAt:   z.string().datetime({ message: "Geçerli tarih-saat girin" }),
  reason:  z.string().optional(),
}).refine(
  (d) => new Date(d.startAt) < new Date(d.endAt),
  { message: "Başlangıç tarihi bitiş tarihinden önce olmalıdır", path: ["endAt"] }
);
export type CreateTimeOffInput = z.infer<typeof createTimeOffSchema>;

// ─── Holiday ──────────────────────────────────────────────────────────────────
export const createHolidaySchema = z.object({
  name: z.string().min(2, "Tatil adı en az 2 karakter olmalıdır"),
  date: z.string().date("Geçerli tarih formatı: YYYY-MM-DD"),
});
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;

// ─── Appointment ──────────────────────────────────────────────────────────────
export const createAppointmentSchema = z.object({
  serviceId: z.string().uuid("Geçersiz hizmet ID"),
  staffId:   z.string().uuid("Geçersiz personel ID"),
  date:      z.string().date("Geçerli tarih formatı: YYYY-MM-DD"),
  startTime: z.string().regex(timeRegex, "Geçerli saat: HH:mm"),
  customerId: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().uuid().optional()),
  guestName:  z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().min(2, "Ad soyad en az 2 karakter").optional()),
  guestPhone: z.string().min(7, "Geçerli telefon numarası giriniz"),
  guestEmail: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().email("Geçerli e-posta giriniz").optional()),
  notes:      z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().max(500).optional()),
  locationId: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().uuid().optional()),
}).refine(
  (d) => d.customerId || d.guestName,
  { message: "Kayıtlı müşteri veya misafir adı gerekilidir", path: ["guestName"] }
);

export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  cancelReason:  z.string().max(300).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  newDate:       z.string().date(),
  newStartTime:  z.string().regex(timeRegex),
});

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED", "NO_SHOW"]),
  internalNotes: z.string().optional(),
});

export type CreateAppointmentInput        = z.infer<typeof createAppointmentSchema>;
export type CancelAppointmentInput        = z.infer<typeof cancelAppointmentSchema>;
export type RescheduleAppointmentInput    = z.infer<typeof rescheduleAppointmentSchema>;
export type UpdateAppointmentStatusInput  = z.infer<typeof updateAppointmentStatusSchema>;

// ─── Customer ─────────────────────────────────────────────────────────────────
export const createCustomerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter"),
  lastName:  z.string().min(2, "Soyad en az 2 karakter"),
  email:     z.string().email("Geçerli e-posta giriniz").optional(),
  phone:     z.string().min(10, "Geçerli telefon giriniz").optional(),
  notes:     z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

// ─── Tenant Settings ──────────────────────────────────────────────────────────
export const updateTenantSettingsSchema = z.object({
  bookingWindowDays:     z.coerce.number().min(1).max(365).optional(),
  minNoticeHours:        z.coerce.number().min(0).max(168).optional(),
  maxAppointmentsPerDay: z.coerce.number().min(0).optional(),
  slotIntervalMinutes:   z.enum(["10", "15", "20", "30", "60"]).transform(Number).optional(),
  autoConfirm:           z.boolean().optional(),
  emailNotifications:    z.boolean().optional(),
  smsNotifications:      z.boolean().optional(),
  reminderHoursBefore:   z.coerce.number().min(1).max(72).optional(),
  primaryColor:          z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  businessHoursStart:    z.string().regex(timeRegex).optional(),
  businessHoursEnd:      z.string().regex(timeRegex).optional(),
});
export type UpdateTenantSettingsInput = z.infer<typeof updateTenantSettingsSchema>;

// ─── Query / Filter ───────────────────────────────────────────────────────────
export const appointmentQuerySchema = z.object({
  page:      z.coerce.number().min(1).default(1),
  pageSize:  z.coerce.number().min(1).max(1000).default(20),
  status:    z.enum(["PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED", "NO_SHOW"]).optional(),
  staffId:   z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  dateFrom:  z.string().date().optional(),
  dateTo:    z.string().date().optional(),
  search:    z.string().optional(),
  sortBy:    z.enum(["startAt", "createdAt", "status"]).default("startAt"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;
