# Emlak Modülü
Bu modül, emlak ilanlarını ekleme, listeleme ve yönetme imkanı sağlar.
## Amaç
SaaS üzerinde kullanıcıların gayrimenkul ilanlarını yönetmesi.
## Endpointler
- GET /api/emlak: Tüm emlakları listeler
- POST /api/emlak: Yeni emlak ekler
- PUT /api/emlak/:id: Emlak bilgisini günceller
- DELETE /api/emlak/:id: Emlak ilanını siler
## Veri Modeli
Prisma modeli `Emlak` tablosu ile yönetilir (ör: id, title, price, location, userId).
