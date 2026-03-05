# Randevu Modülü
Bu modül, kullanıcıların randevu oluşturmasını, görüntülemesini ve yönetmesini sağlar.
## Amaç
Kullanıcı bazlı randevu takip sistemini SaaS altyapısı üzerinde sağlar.
## Endpointler
- GET /api/randevu: Tüm randevuları listeler
- POST /api/randevu: Yeni randevu oluşturur
- PUT /api/randevu/:id: Randevuyu günceller
- DELETE /api/randevu/:id: Randevuyu siler
## Veri Modeli
Prisma modeli `Randevu` tablosu ile yönetilir (ör: id, title, startTime, endTime, userId).
