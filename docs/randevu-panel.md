# Randevu Paneli — Modül Dokümantasyonu

**Versiyon:** 2.0 &nbsp;|&nbsp; **Son Güncelleme:** Mart 2026 &nbsp;|&nbsp; **Teknoloji:** Next.js 15 · Prisma · PostgreSQL

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [URL Yapısı](#url-yapısı)
3. [Veritabanı Şeması](#veritabanı-şeması)
4. [Server Actions (API Katmanı)](#server-actions)
5. [Özellikler — Panel (Admin)](#özellikler--panel-admin)
6. [Özellikler — Müşteri Booking Flow](#özellikler--müşteri-booking-flow)
7. [Özellikler — Randevu Onay Sayfası](#özellikler--randevu-onay-sayfası)
8. [Özellikler — Randevu Sorgulama](#özellikler--randevu-sorgulama)
9. [Bileşen Katmanı (Components)](#bileşen-katmanı-components)
10. [Utility Katmanı](#utility-katmanı)
11. [Kalıplar ve Kararlar](#kalıplar-ve-kararlar)

---

## Genel Bakış

Randevu Paneli, işletmelerin (berber, klinik, öğretmen vb.) online randevu yönetimini sağlayan **multi-tenant** bir SaaS modülüdür. Her işletme kendi `slug`'ı altında izole çalışır.

```
/{tenantSlug}/randevu-panel/
  ├── book/                      ← Müşteri booking akışı
  ├── book/{appointmentId}/      ← Randevu onay sayfası (YENİ)
  ├── sorgula/                   ← Randevu sorgulama (YENİ)
  └── dashboard/                 ← Admin paneli
```

---

## URL Yapısı

### Müşteri Tarafı

| Sayfa           | URL                               | Açıklama                  |
| --------------- | --------------------------------- | ------------------------- |
| Booking Akışı   | `/{slug}/randevu-panel/book`      | 4 adımlı randevu alma     |
| Randevu Onay    | `/{slug}/randevu-panel/book/{id}` | QR + paylaşım + detay     |
| Randevu Sorgula | `/{slug}/randevu-panel/sorgula`   | Telefon ile randevu arama |

### Admin (Dashboard)

| Sayfa          | URL                                            | Açıklama                |
| -------------- | ---------------------------------------------- | ----------------------- |
| Dashboard      | `/{slug}/randevu-panel/dashboard`              | Özet istatistikler      |
| Takvim         | `/{slug}/randevu-panel/dashboard/calendar`     | Günlük/haftalık görünüm |
| Randevular     | `/{slug}/randevu-panel/dashboard/appointments` | Liste + durum yönetimi  |
| Personel       | `/{slug}/randevu-panel/dashboard/staff`        | Personel listesi        |
| Personel Ekle  | `/{slug}/randevu-panel/dashboard/staff/new`    | Yeni personel ekleme    |
| Personel Detay | `/{slug}/randevu-panel/dashboard/staff/{id}`   | Düzenleme               |
| Hizmetler      | `/{slug}/randevu-panel/dashboard/services`     | Hizmet yönetimi         |
| Müşteriler     | `/{slug}/randevu-panel/dashboard/customers`    | Müşteri listesi         |
| Raporlar       | `/{slug}/randevu-panel/dashboard/reports`      | Gelir + istatistik      |
| Ayarlar        | `/{slug}/randevu-panel/dashboard/settings`     | Tenant ayarları         |

---

## Veritabanı Şeması

### Temel Modeller

```
Tenant
 ├── Staff            (Personeller)
 │    ├── AvailabilityRule   (Haftalık çalışma saatleri)
 │    ├── StaffBreak  ★YENİ  (Mola tanımları — günlük+saatlik)
 │    ├── TimeOff             (İzin kayıtları — tarih aralığı)
 │    └── StaffService        (Personel↔Hizmet m2m)
 ├── Service           (Hizmetler — süre, fiyat, renk)
 ├── Appointment       (Randevular)
 │    ├── Customer?    (Kayıtlı müşteri bağlantısı)
 │    └── Location?    (Şube bağlantısı)
 ├── Customer          (Müşteri kayıtları — otomatik upsert)
 ├── Location          (Şubeler)
 ├── Holiday           (Resmi/işletme tatilleri)
 ├── TenantSettings    (Randevu politikaları)
 ├── CancelPolicy      (İptal kuralları)
 └── AuditLog          (Değişiklik geçmişi)
```

### StaffBreak Modeli (Yeni)

```prisma
model StaffBreak {
  id        String  @id @default(uuid())
  staffId   String
  tenantId  String
  dayOfWeek Int     // 0=Pazar ... 6=Cumartesi
  startTime String  // "12:00"
  endTime   String  // "13:00"
  label     String? // "Öğle Arası"
}
```

> **Önemli:** Mola saatleri, `getAvailableSlots` içinde `OccupiedPeriod` olarak işlenir. Müşteri booking ekranında bu saatler **disabled** görünür.

### Appointment Durumları

| Durum         | Açıklama          |
| ------------- | ----------------- |
| `PENDING`     | Onay bekliyor     |
| `CONFIRMED`   | Onaylandı         |
| `CANCELLED`   | İptal edildi      |
| `RESCHEDULED` | Yeniden planlandı |
| `COMPLETED`   | Tamamlandı        |
| `NO_SHOW`     | Müşteri gelmedi   |

---

## Server Actions

### `appointment.actions.ts`

| Fonksiyon                                                  | Açıklama                                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `getAvailableSlots(staffId, dateStr, serviceId, tenantId)` | Personelin o gün müsait saatlerini üretir. Tatil, izin ve **mola** (★) kontrolü yapar                    |
| `createAppointment(data, tenantId)`                        | Randevu oluşturur. Çakışma kontrolü, minNotice, maxDays validasyonu. Müşteri otomatik upsert             |
| `getAppointments(tenantId, query)`                         | Sayfalı + filtreli randevu listesi (`status`, `staffId`, `serviceId`, `dateFrom/To`, `search`, `sortBy`) |
| `updateAppointmentStatus(input, tenantId)`                 | Durum günceller + AuditLog                                                                               |
| `rescheduleAppointment(input, tenantId)`                   | Yeni tarih + saat ile randevuyu yeniden planlar. Çakışma kontrolü yapar                                  |
| `cancelAppointment(input, tenantId)`                       | CancelPolicy kuralına göre iptal                                                                         |
| `getDashboardStats(tenantId)`                              | Bugün (toplam/onaylı/bekleyen) · Hafta (onaylı+tamamlanan) · Ay (gelir)                                  |
| `getAppointmentById(id, tenantSlug)` ★                     | Onay sayfası için randevu detayı                                                                         |
| `getAppointmentsByPhone(phone, tenantSlug)` ★              | Sorgulama sayfası için telefona göre randevu listesi (son 20, kısmi eşleşme)                             |

### `staff.actions.ts`

| Fonksiyon                              | Açıklama                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| `getStaff(tenantId, onlyActive?)`      | Personel listesi (hizmetler + müsaitlik dahil)           |
| `getStaffById(id, tenantId)`           | Detay (aktif izinler dahil)                              |
| `createStaff(data, tenantId)`          | Oluşturma. ServiceIds + availability birlikte kaydedilir |
| `updateStaff(id, data, tenantId)`      | Güncelleme                                               |
| `deleteStaff(id, tenantId)`            | Aktif randevusu yoksa siler                              |
| `setAvailabilityRules(data, tenantId)` | Haftalık çalışma saatlerini toplu günceller              |
| `createTimeOff(data, tenantId)`        | İzin kaydı ekler                                         |
| `createStaffBreak(data, tenantId)` ★   | Mola ekler                                               |
| `getStaffBreaks(staffId, tenantId)` ★  | Mola listesi                                             |
| `deleteStaffBreak(id, tenantId)` ★     | Mola siler                                               |

### `service.actions.ts`

| Fonksiyon                            | Açıklama                    |
| ------------------------------------ | --------------------------- |
| `getServices(tenantId, onlyActive?)` | Hizmet listesi              |
| `createService(data, tenantId)`      | Hizmet oluşturma            |
| `updateService(id, data, tenantId)`  | Güncelleme                  |
| `deleteService(id, tenantId)`        | Aktif randevusu yoksa siler |

### `customer.actions.ts`

| Fonksiyon                                         | Açıklama                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `getCustomers(tenantId, search?, page, pageSize)` | Sayfalı müşteri listesi. Ad/soyad/e-posta/telefon üzerinden arama. `_count.appointments` dahil |
| `getCustomerById(id, tenantId)`                   | Detay + son 20 randevu (hizmet ve personel dahil)                                              |
| `createCustomer(data, tenantId)`                  | Oluşturma. E-posta çakışma kontrolü yapılır                                                    |
| `updateCustomer(id, data, tenantId)`              | Güncelleme                                                                                     |
| `deleteCustomer(id, tenantId)`                    | Silme                                                                                          |

### `tenant.actions.ts`

| Fonksiyon                              | Açıklama                                                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `getTenantSettings(tenantId)`          | Ayarlar yoksa otomatik oluşturur (upsert)                                                                                         |
| `updateTenantSettings(data, tenantId)` | Upsert — booking politikaları, bildirim, renk ayarları                                                                            |
| `getHolidays(tenantId)`                | Tatil listesi (tarihe göre sıralı)                                                                                                |
| `createHoliday(data, tenantId)`        | Tatil ekle (ad + YYYY-MM-DD). Aynı gün için unique constraint var                                                                 |
| `deleteHoliday(id, tenantId)`          | Tatil sil                                                                                                                         |
| `getReports(tenantId, from, to)`       | Tarih aralığında: durum dağılımı, hizmet bazlı sayı, personel bazlı sayı, no-show sayısı, toplam gelir (tamamlanan randevulardan) |

---

## Özellikler — Panel (Admin)

### Personel Yönetimi

#### Yeni Personel Ekleme (`NewStaffForm`)

| Bölüm                | Detay                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Kişisel Bilgiler** | Ad soyad, telefon, biyografi, takvim rengi                                                                                 |
| **Hizmetler**        | Seçili hizmetler badge olarak. Hizmet yoksa veya yeni hizmet eklemek için **inline dialog** açılır ★                       |
| **Çalışma Saatleri** | Pazartesi–Pazar, gün bazında aktif/pasif + başlangıç/bitiş saati                                                           |
| **İzin Tanımlama** ★ | Tarih-saat aralığı + sebep. Form submit'te `createTimeOff` çağrılır                                                        |
| **Mola Tanımlama** ★ | Gün + saat aralığı + etiket (ör. "Öğle Arası"). `createStaffBreak` çağrılır. Bu saatler randevu ekranında **dolu** görünür |

#### Hızlı Hizmet Ekleme Dialog'u (`QuickServiceDialog`) ★

Personel ekleme ekranında hizmet tanımlanmamışken "Hizmet tanımla" butonuna tıklanınca açılan modal:

- Ad, süre (dk), fiyat (₺), renk
- Kayıt sonrası hizmet listesine otomatik eklenir ve seçili gelir
- Harici sayfaya gitmeden form bağlamı korunur

### Ayarlar (`TenantSettings`)

| Alan                     | Varsayılan    | Açıklama                             |
| ------------------------ | ------------- | ------------------------------------ |
| `bookingWindowDays`      | 60            | Kaç gün ilerisine randevu alınabilir |
| `minNoticeHours`         | 2             | Minimum önceden bildirim süresi      |
| `slotIntervalMinutes`    | 15            | Slot adımı (10/15/20/30/60 dk)       |
| `autoConfirm`            | false         | Otomatik onay                        |
| `businessHoursStart/End` | 09:00 / 18:00 | İşletme saatleri                     |

### İptal Politikası (`CancelPolicy`)

- `minHoursBeforeCancel` (varsayılan: 12 saat)
- `minHoursBeforeReschedule` (varsayılan: 4 saat)
- `allowGuestCancel`

---

## Özellikler — Müşteri Booking Flow

4 adımlı, doğrusal akış. Her adımda geri dönülebilir.

### Adım 1: Hizmet Seçimi

Aktif hizmet kartları — isim, açıklama, süre, fiyat.

### Adım 2: Uzman Seçimi

Seçilen hizmeti verebilen personeller listelenir. Renk avatar + biyografi.

### Adım 3: Tarih & Saat — `AppointmentCalendar` ★

**Aylık görünüm:**

- Ay navigasyonu (önceki/sonraki)
- Geçmiş ve booking window dışı günler disabled
- Bugün için nokta göstergesi
- Seçili güne tıklandığında `opacity + scale` CSS transition ile gün görünümüne geçer (280ms)

**Günlük görünüm:**

- `getAvailableSlots` çağrısı (tatil + izin + **mola** + mevcut randevular birlikte)
- Müsait saatler 3–4 kolonlu grid
- Dolu saatler `line-through + disabled`
- Saat seçilince otomatik Adım 4'e geçilir

### Adım 4: Kişisel Bilgiler

| Alan          | Detay                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Ad Soyad**  | Zorunlu, min 2 karakter                                                                       |
| **Telefon** ★ | `PhoneMaskInput` — format: `0XXX XXX XX XX`. Harici kütüphane yok, saf onChange ile maskeleme |
| **E-posta** ★ | Opsiyonel. Blur'da `@` ve `.` kontrol, geçersizse kırmızı border + inline hata                |
| **Notlar**    | Opsiyonel, max 500 karakter                                                                   |

**Submit sonrası:** `createAppointment` çağrılır. Müşteri `guestPhone` üzerinden otomatik upsert. Başarılıysa `/book/{id}` sayfasına yönlendirilir.

---

## Özellikler — Randevu Onay Sayfası ★

**URL:** `/{slug}/randevu-panel/book/{appointmentId}`

**Server Component** — ISR.

| Bölüm               | Detay                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| **Gradient Header** | Mavi–indigo gradient, büyük emoji, başlık                                                                |
| **Durum Badge**     | PENDING/CONFIRMED/… renkli badge                                                                         |
| **Detay Kartı**     | Randevu no (ilk 8 karakter büyük harf), hizmet, uzman, tarih&saat, ad soyad, konum, not                  |
| **QR Kod** ★        | `qrcode` npm paketi — server-side PNG olarak üretilir (koyu mavi, 200×200). QR içeriği: sorgulama URL'si |
| **Paylaş Butonu** ★ | Web Share API — desteklenmiyorsa clipboard fallback                                                      |
| **QR İndir** ★      | `<a download>` ile PNG dosyası olarak indirilir                                                          |
| **Yeni Randevu**    | `/book` sayfasına geri bağlantı                                                                          |

---

## Özellikler — Randevu Sorgulama ★

**URL:** `/{slug}/randevu-panel/sorgula`

**Akış:**

1. Kullanıcı telefon numarasını `PhoneMaskInput` ile girer (`0XXX XXX XX XX`)
2. `getAppointmentsByPhone` — `guestPhone` veya `customer.phone` üzerinden kısmi eşleşme, son 20 randevu
3. Sonuçlar tıklanabilir kart olarak listelenir (hizmet rengi, uzman, tarih, durum badge)
4. Karta tıklanınca `/book/{id}` onay sayfasına gidilir

---

## Bileşen Katmanı (Components)

> `src/modules/randevu/components/` altındaki tüm UI bileşenleri. Her klasör bir işlevsel alan temsil eder.

### `appointments/`

#### `AppointmentActions.tsx`

Admin randevu listesinde her satırın sağında yer alan durum güncelleme butonları. Statüye göre gösterilen butonlar değişir:

| Mevcut Durum                      | Gösterilen Butonlar                   |
| --------------------------------- | ------------------------------------- |
| `PENDING`                         | Onayla · Tamamlandı · Gelmedi · İptal |
| `CONFIRMED`                       | Tamamlandı · Gelmedi · İptal          |
| `CANCELLED / COMPLETED / NO_SHOW` | — (pasif)                             |

`updateAppointmentStatus` veya `cancelAppointment` çağrısı yapar. Loading state ve toast mesajı içerir.

#### `AppointmentLookup.tsx` ★

Müşteri sorgulama sayfası için bileşen. Bkz. [Randevu Sorgulama](#özellikler--randevu-sorgulama).

---

### `booking/`

#### `BookingFlow.tsx`

4 adımlı müşteri akışı. Bkz. [Müşteri Booking Flow](#özellikler--müşteri-booking-flow).

#### `AppointmentCalendar.tsx` ★

Animasyonlu çift modlu takvim. Bkz. [Adım 3](#adım-3-tarih--saat--appointmentcalendar-).

#### `PhoneMaskInput.tsx` ★

Telefon maskesi bileşeni. Bkz. [Adım 4](#adım-4-kişisel-bilgiler).

---

### `calendar/`

#### `CalendarView.tsx`

Admin paneli takvim sayfasında kullanılan aylık görünüm bileşeni:

- Ay navigasyonu (← →)
- 7×N grid, her hücre ≥80px yükseklik
- Günde birden fazla randevu varsa ilk 3'ü gösterir, kalanlar `+N daha` şeklinde
- Her randevu kartı durum renginde arka plan (`STATUS_COLORS`), `HH:mm hizmet_adı` formatında
- Bugünün hücresi `var(--brand-primary)` renginde ring ile vurgulanır
- `Appointment[]` prop olarak alır — server component'ten pre-fetch edilmiş veri gelir

---

### `layout/`

#### `SidebarNav.tsx`

Admin dashboard'un sol kenar çubuğu navigasyonu:

- Dashboard · Takvim · Randevular · Personel · Hizmetler · Müşteriler · Raporlar · Ayarlar bağlantıları
- Aktif rota `--brand-primary` rengiyle vurgulanır
- `tenantSlug` prop ile dinamik URL oluşturur

#### `SidebarUserMenu.tsx`

Sidebar altındaki kullanıcı menüsü. Oturum açık kullanıcının adı ve çıkış butonu.

---

### `services/`

#### `ServiceList.tsx`

Hizmet yönetim sayfasının ana bileşeni:

- Hizmet kartları: renk badge, ad, süre, fiyat, buffer time, aktif/pasif durumu
- Satır içi düzenleme (isim, süre, fiyat, renk, aktiflik toggle)
- `deleteService` action — aktif randevusu olan hizmetler silinemez, uyarı toast gösterilir
- Yeni hizmet ekleme formu (inline expand)

#### `QuickServiceDialog.tsx` ★

Modal dialog — bkz. [Hızlı Hizmet Ekleme](#hızlı-hizmet-ekleme-dialogu-quickservicedialog-).

---

### `settings/`

#### `SettingsForm.tsx`

Tenant ayarları sayfasının formu. Bölümler:

| Bölüm                  | Alanlar                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Randevu Politikası** | `bookingWindowDays`, `minNoticeHours`, `slotIntervalMinutes`, `autoConfirm`           |
| **İş Saatleri**        | `businessHoursStart`, `businessHoursEnd`                                              |
| **Bildirimler**        | `emailNotifications`, `smsNotifications`, `reminderHoursBefore`                       |
| **Marka Rengi**        | `primaryColor` (color picker)                                                         |
| **Tatil Günleri**      | Ad + tarih girişi; `createHoliday` / `deleteHoliday`. Tatil günlerinde slot üretilmez |
| **İptal Politikası**   | `minHoursBeforeCancel`, `minHoursBeforeReschedule`, `allowGuestCancel`                |

`updateTenantSettings` action'ı upsert olarak çağrılır.

---

### `staff/`

#### `NewStaffForm.tsx` ★

Yeni personel ekleme formu. Bkz. [Personel Yönetimi](#personel-yönetimi).

#### `StaffDetailForm.tsx`

Mevcut personeli düzenleme formu. `/{slug}/dashboard/staff/{id}` sayfasında kullanılır:

| Bölüm                | Detay                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Profil Özeti**     | Avatar (renk + baş harf), ad, biyografi, hizmet badge'leri (salt okunur)                                    |
| **Çalışma Saatleri** | Pazartesi–Pazar toggle + saat aralığı. "Saatleri Kaydet" butonu `setAvailabilityRules` çağrısı yapar        |
| **İzin Günleri**     | Yeni izin ekleme (datetime-local aralığı + sebep) + mevcut izinlerin listesi. `createTimeOff` çağrısı yapar |

> **Not:** `StaffDetailForm`, mevcut izinleri `staff.timeOffs` prop'u ile alır (gelecek tarihli izinler filtrelenmiş). Hizmet ve mola yönetimi bu formda henüz yok — `NewStaffForm`'da form submit'te yapılıyor.

---

## Utility Katmanı

### `utils/time-slots.ts`

```ts
generateTimeSlots(
  date, availability, occupied, serviceDuration, bufferTime, slotInterval, timezone
): TimeSlot[]
```

- `occupied` dizisine hem mevcut randevular hem de `StaffBreak` blokları aktarılır
- `bufferTime`: randevu sonrasına eklenen hazırlık süresi
- `timezone`: `date-fns-tz` ile birlikte kullanılır (varsayılan `Europe/Istanbul`)

### `utils/date.ts`

`buildDateTime(date, time, timezone)` — tarih string + saat string → UTC `Date` objesi.

### `utils/constants.ts`

- `APPOINTMENT_STATUS_LABELS` — Türkçe durum etiketleri
- `APPOINTMENT_STATUS_COLORS` — Tailwind badge sınıfları
- `DAY_NAMES` / `DAY_SHORT_NAMES` — Haftanın günleri
- `CURRENCIES` — TRY/EUR/USD/GBP

### `lib/logger.ts`

`pino` tabanlı yapılandırılmış loglama. Tüm action'lar hata durumunda `logger.error({ err }, "...")` çağrısı yapar.

### `lib/branding.ts`

Tenant'ın marka renklerini (`primaryColor`, `secondaryColor`) CSS custom property olarak dönen yardımcı fonksiyon. Booking ve panel layout'larında kullanılır.

---

## Kalıplar ve Kararlar

### Slot Üretim Mantığı

```
Kullanılabilir pencere = AvailabilityRule (HH:mm–HH:mm)
Engeller = [Mevcut randevular] + [StaffBreak bloğu] + [İzin (TimeOff)]
Her engel OccupiedPeriod olarak flatten edilir
```

### Müşteri Otomatik Upsert

`createAppointment` içinde, `guestPhone` eşleşmesine göre mevcut müşteri bulunur ya da yeni kayıt oluşturulur. Randevu müşteriyle ilişkilendirilir.

### Tenant İzolasyonu

Her action `tenantId` parametresi alır ve tüm sorgularda `where: { tenantId }` koşulu zorunlu tutulur. `tenantSlug`'tan `tenantId`'ye dönüşüm action içinde yapılır.

### Zod Validasyonu

Tüm action giriş parametreleri ilgili Zod şemasından geçer. Hata durumunda `{ success: false, error: string }` döner; başarı durumunda `{ success: true, data: ... }`.

### QR Kod Stratejisi

`qrcode` paketi server-side çalıştırılır (`toDataURL` → base64 PNG). Böylece client-side canvas/JS yükü olmadan QR `<img>` olarak serve edilir.

---

## Bağımlılıklar

| Paket          | Kullanım                       |
| -------------- | ------------------------------ |
| `date-fns`     | Tarih/saat manipülasyonu       |
| `date-fns-tz`  | Timezone dönüşümleri           |
| `qrcode`       | QR kod üretimi (server-side) ★ |
| `sonner`       | Toast bildirimleri             |
| `zod`          | Şema validasyonu               |
| `lucide-react` | İkonlar                        |
| `pino`         | Loglama                        |

---

> ★ = Bu sürümde eklenen özellik (v2.0)
