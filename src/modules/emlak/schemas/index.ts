import { z } from "zod";

// ─── Property ────────────────────────────────────────────────────────────────
export const createPropertySchema = z.object({
  title:           z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  type:            z.enum(["APARTMENT","HOUSE","LAND","SHOP","OFFICE","OTHER"]).default("APARTMENT"),
  status:          z.enum(["AVAILABLE","RENTED","FOR_SALE","SOLD","MAINTENANCE"]).default("AVAILABLE"),
  ownerId:         z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().uuid().optional()),
  city:            z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  district:        z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  neighborhood:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  address:         z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  postalCode:      z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  latitude:        z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().optional()),
  longitude:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().optional()),
  squareMeters:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().positive().optional()),
  roomCount:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  floorNumber:     z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().int().optional()),
  totalFloors:     z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().int().positive().optional()),
  hasElevator:     z.boolean().default(false),
  isFurnished:     z.boolean().default(false),
  hasParking:      z.boolean().default(false),
  hasBalcony:      z.boolean().default(false),
  buildingAge:     z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().int().min(0).optional()),
  heatingType:     z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  notes:           z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  purchasePrice:   z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().min(0).optional()),
  purchaseCurrency:z.string().default("TRY"),
  purchaseDate:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().date().optional()),
  marketValue:     z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().min(0).optional()),
  isActive:        z.boolean().default(true),
});

export const updatePropertySchema = createPropertySchema.partial();
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// ─── PropertyOwner ───────────────────────────────────────────────────────────
export const createOwnerSchema = z.object({
  firstName:         z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName:          z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  nationalId:        z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  taxNo:             z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  phone:             z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  phone2:            z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  email:             z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().email("Geçerli e-posta giriniz").optional()),
  address:           z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  bankName:          z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  iban:              z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  accountHolderName: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  notes:             z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  isActive:          z.boolean().default(true),
});

export const updateOwnerSchema = createOwnerSchema.partial();
export type CreateOwnerInput = z.infer<typeof createOwnerSchema>;
export type UpdateOwnerInput = z.infer<typeof updateOwnerSchema>;

// ─── PropertyTenant ──────────────────────────────────────────────────────────
export const createPropertyTenantSchema = z.object({
  firstName:        z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName:         z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  nationalId:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  phone:            z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  phone2:           z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  email:            z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().email("Geçerli e-posta giriniz").optional()),
  emergencyContact: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  emergencyPhone:   z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  notes:            z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  isActive:         z.boolean().default(true),
});

export const updatePropertyTenantSchema = createPropertyTenantSchema.partial();
export type CreatePropertyTenantInput = z.infer<typeof createPropertyTenantSchema>;
export type UpdatePropertyTenantInput = z.infer<typeof updatePropertyTenantSchema>;

// ─── Lease ───────────────────────────────────────────────────────────────────
const _leaseBase = z.object({
  propertyId:        z.string().uuid("Geçersiz mülk ID"),
  propertyTenantId:  z.string().uuid("Geçersiz kiracı ID"),
  ownerId:           z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().uuid().optional()),
  startDate:         z.string().date("Geçerli tarih giriniz (YYYY-MM-DD)"),
  endDate:           z.string().date("Geçerli tarih giriniz (YYYY-MM-DD)"),
  rentAmount:        z.coerce.number().positive("Kira tutarı 0'dan büyük olmalıdır"),
  currency:          z.string().default("TRY"),
  paymentDayOfMonth: z.coerce.number().min(1).max(31).default(1),
  depositAmount:     z.coerce.number().min(0).default(0),
  depositPaid:       z.boolean().default(false),
  contractUrl:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  autoRenew:         z.boolean().default(false),
  renewalRate:       z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().min(0).max(100).optional()),
  notes:             z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
});

export const createLeaseSchema = _leaseBase.refine(d => new Date(d.startDate) < new Date(d.endDate), {
  message: "Başlangıç tarihi bitiş tarihinden önce olmalıdır",
  path: ["endDate"],
});

export const updateLeaseSchema = _leaseBase.partial();
export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;

export const endLeaseSchema = z.object({
  leaseId:           z.string().uuid(),
  status:            z.enum(["ENDED", "TERMINATED"]),
  terminationReason: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  depositReturnDate: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().date().optional()),
});
export type EndLeaseInput = z.infer<typeof endLeaseSchema>;

// ─── LeasePayment ────────────────────────────────────────────────────────────
export const markPaymentPaidSchema = z.object({
  paymentId:     z.string().uuid(),
  paidAmount:    z.coerce.number().positive("Ödeme tutarı 0'dan büyük olmalıdır"),
  paidAt:        z.string().datetime({ message: "Geçerli tarih giriniz" }),
  paymentMethod: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  receiptNo:     z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  notes:         z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
});
export type MarkPaymentPaidInput = z.infer<typeof markPaymentPaidSchema>;

// ─── PropertySubscription ────────────────────────────────────────────────────
export const createSubscriptionSchema = z.object({
  propertyId:             z.string().uuid("Geçersiz mülk ID"),
  type:                   z.string().min(1, "Abonelik türü seçiniz"),
  subscriberName:         z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  subscriberNo:           z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  provider:               z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  contractNo:             z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  estimatedMonthlyAmount: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.coerce.number().min(0).optional()),
  currency:               z.string().default("TRY"),
  startDate:              z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().date().optional()),
  endDate:                z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().date().optional()),
  isActive:               z.boolean().default(true),
  notes:                  z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

// ─── PropertyDocument ────────────────────────────────────────────────────────
export const createDocumentSchema = z.object({
  propertyId: z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().uuid().optional()),
  leaseId:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().uuid().optional()),
  type:       z.string().min(1, "Belge türü seçiniz"),
  title:      z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  fileUrl:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().url("Geçerli bir URL giriniz").optional()),
  expiresAt:  z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().date().optional()),
  notes:      z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
});

export const updateDocumentSchema = createDocumentSchema.partial();
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

// ─── PropertyPhoto ───────────────────────────────────────────────────────────
export const createPhotoSchema = z.object({
  propertyId: z.string().uuid(),
  url:        z.string().url("Geçerli bir URL giriniz"),
  caption:    z.preprocess(v => (v === "" || v == null) ? undefined : v, z.string().optional()),
  isPrimary:  z.boolean().default(false),
  order:      z.coerce.number().int().min(0).default(0),
});
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;

// ─── Query ───────────────────────────────────────────────────────────────────
export const propertyQuerySchema = z.object({
  page:     z.coerce.number().min(1).default(1),
  limit:    z.coerce.number().min(1).max(100).default(20),
  search:   z.string().optional(),
  status:   z.string().optional(),
  type:     z.string().optional(),
  city:     z.string().optional(),
  ownerId:  z.string().optional(),
});
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;
