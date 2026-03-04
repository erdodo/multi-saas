# Multi-Tenant SaaS Platform (Core Repository)

Bu döküman, birden fazla alt modüle sahip, geniş çaplı ve multi-tenant (çoklu kiracı) mimarisinde çalışacak SaaS projesinin ana reposunun mimarisini ve gereksinimlerini tanımlar.

## 🏗️ Mimari ve Teknoloji Yığını

- **Core Framework:** Next.js (App Router, React)
- **Veritabanı ORM:** Prisma
- **İlk Aşama Veritabanı:** SQLite
- **Hedef Veritabanı:** PostgreSQL
- **Uygulama Tipi:** PWA (Progressive Web App) - Native mobil uygulama hissiyatı.
- **Temel Konsept:** Ana repoda merkezi kimlik doğruluğu (Auth), setup akışı, profil ve tenant (işletme) yönetimi bulunur. Tüm ortak müşteri verileri bu repoda tutulur.

## 📌 Ana Repo Görevleri ve Özellikleri

### 1. Kimlik Doğrulama ve Kurulum (Auth & Setup)

- `Login`, `Register` ve şifre sıfırlama ekranları.
- Kullanıcı ilk kez kayıt olduğunda devreye giren **Setup (Kurulum)** sihirbazı.
- İşletme bilgileri ve kullanılacak modüllerin (Randevu, Emlak vb.) seçimi.

### 2. Yönlendirme ve Dashboard Mimarisi

- Kullanıcının yetkisi tek bir modüle ise (örn. sadece berber), giriş sonrası doğrudan `/app/randevu` yönlendirmesi.
- Kullanıcı birden fazla modüle sahipse, giriş sonrası `/app` dizininde modül seçebileceği bir **Grid Menü (Uygulamalarım)** ekranı.

### 3. Progressive Web App (PWA)

- Offline erişim, caching ve icon/manifest ayarları.
- Web üzerinden girildiğinde "Uygulamayı Yükle" veya "Ana Ekrana Ekle" benzeri zorunlu/hatırlatıcı popup entegrasyonu.
- Mobil cihazlarda Play Store / App Store hissiyatı verecek native tasarım kalıpları.

### 4. API & Webhook Altyapısı

- Entegrasyonlar ve alt sistemlerin haberleşmesi için %100 API odaklı mimari.
- Sisteme dışarıdan veya içeriden veri basılması/okunması için Webhook yönlendirmeleri.

### 5. Ortak Veritabanı (Core Database)

- **User / Tenant Modeli:** İşletmelerin ve işletme çalışanlarının hesapları.
- **Customer (Müşteri) Modeli:** İşletmelerin sahip olduğu tüm müşteriler. Alt modüller bu ortak havuza bağlanır.

---

## 🧩 Alt Modüller (Daha Sonra Geliştirilecek İçerikler)

### A. Randevu Paneli (`/{slug}/randevu-panel`)

- **Hedef Kitle:** Berberler, özel öğretmenler, diyetisyenler, doktorlar, güzellik salonları vb.
- **Admin Panel Özellikleri:**
  - Personel oluşturma/düzenleme (çalışma saatleri, hizmetler, takvim rengi)
  - **Personel İzin Tanımlama:** Tarih aralığı + sebep ile izin ekleme ★
  - **Mola Tanımlama:** Gün + saat aralığı bazında mola (ör. öğle arası). Bu saatler booking ekranında dolu görünür ★
  - **Hızlı Hizmet Ekleme:** Personel eklerken hizmet yoksa inline dialog ile hızlı hizmet tanımlama ★
  - Hizmet oluşturma/düzenleme (süre, fiyat, renk, buffer time)
  - Takvim görünümü (günlük/haftalık), randevu durum yönetimi
  - Müşteri listesi, raporlar, gelir takibi, tatil tanımlama
  - Tenant ayarları (slot aralığı, min notice, booking window, otomatik onay)
- **Müşteri Booking Özellikleri:**
  - 4 adımlı akış: Hizmet → Uzman → Tarih&Saat → Bilgiler
  - **Animasyonlu Takvim Seçici:** Aylık görünüm → güne tıklayınca gün görünümüne animasyonlu geçiş. Müsait saatler grid olarak listelenir ★
  - **Telefon Maskesi:** `0XXX XXX XX XX` formatı otomatik uygulanır ★
  - **E-posta Doğrulama:** `@` ve `.` kontrolü, blur'da anlık hata gösterimi ★
  - **Randevu Onay Sayfası:** QR kod (server-side), paylaş (Web Share API), QR indir ★
  - **Randevu Sorgulama:** Telefon numarası ile geçmiş randevulara erişim ★

> 📄 Detaylı teknik dokümantasyon: [`docs/randevu-panel.md`](docs/randevu-panel.md)

### B. Emlak Modülü (`/{slug}/emlak-panel`)

- **Hedef Kitle:** Emlakçılar, mülk yöneticileri.
- **Özellikler:** Satılık/Kiralık listelemesi, güncel ve geçmiş sözleşmelerin tutulması, kiracı profili. (İleride Sahibinden.com entegrasyonu).

### C. Ders Takip Modülü (`/app/ders`)

- **Hedef Kitle:** Özel eğitim merkezleri, dershaneler.
- **Özellikler:** Öğrenci yoklama sistemi, ders saati bildirimleri, finansal takip ve öğrenci gelişim takip grafikleri.

---

## 🚀 Geliştirme Yol Haritası (Roadmap)

1. [ ] Next.js projesinin PWA desteğiyle ayağa kaldırılması.
2. [ ] Prisma'nın SQLite ile yapılandırılması. `User`, `Tenant`, `Module` ve `Customer` şemalarının yazılması.
3. [ ] Kimlik doğrulama sisteminin (Auth) ve Kurulum (Setup) ekranlarının geliştirilmesi.
4. [ ] Grid Layout (Dashboard) ve modül tabanlı URL yönlendirmelerinin (Routing) inşası.
5. [ ] Ortak API uçlarının (İşletme ve Müşteri yönetimi) yazılması ve Webhook temelinin atılması.
