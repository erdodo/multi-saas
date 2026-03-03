import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2, "Hizmet adı en az 2 karakter olmalıdır"),
  duration: z.coerce.number().min(5, "Süre en az 5 dakika olmalıdır"),
  price: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  color: z.string().optional(),
});

export const createStaffSchema = z.object({
  name: z.string().min(2, "Personel adı en az 2 karakter olmalıdır"),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string()).min(1, "En az bir hizmet seçilmelidir"),
});

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Hizmet seçilmelidir"),
  staffId: z.string().min(1, "Personel seçilmelidir"),
  date: z.string().min(1, "Tarih seçilmelidir"),
  startTime: z.string().min(1, "Saat seçilmelidir"),
  customerName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
  customerPhone: z.string().min(10, "Geçerli bir telefon numarası giriniz").optional(),
  customerEmail: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
  notes: z.string().optional(),
});
