# multi-saas

Modüler SaaS altyapısı.

## Proje Yapısı

```
modules/
  core/          # Tenant yönetimi, kullanıcı-oturum ve çekirdek veri mantığı
  frontend/      # Next.js tabanlı çoklu tenant frontend kodları
  db/            # Prisma config, migration ve seed işlemleri
  integrations/  # Vercel ayarları, .env ve entegrasyon scriptleri
  utils/         # Ortak konfigürasyon, tipler ve yardımcılar
```

### Ana Modüller

- **Core:** Tenant, kullanıcı, oturum ve temel iş mantığı. Ortak service/repository yapısı.
- **Frontend:** Çoklu tenant Next.js UI, ortak layout ve authentication.
- **Database & ORM:** Prisma şeması, migration ve seed scriptleri, multi-tenant veri tasarımı.
- **Integrations:** Vercel deploy scriptleri, env örnekleri ve eksternal API entegrasyonları.
- **Utilities/Shared:** Ortak fonksiyonlar, config, type tanımları.

## Başlangıç

```bash
git clone https://github.com/erdodo/multi-saas.git
cd multi-saas
npm install
```

### Katkı İlkesine ve Issue/PR Şablonlarına Dikkat Ediniz!

- Atomic commit, ayrı branch, TypeScript + ESLint standardı.
- Modül/katmanda değişiklikler için [./modules/*](./modules/) dizilimine uyun.
- Issue açarken & PR gönderirken `.github/ISSUE_TEMPLATE` ve `.github/PULL_REQUEST_TEMPLATE` kullanınız.

## Mimariden Sorumlu Kişi
Proje sorumlusu ve mimari desteği için iletişime geçebilirsiniz.

---
Detaylar [CONTRIBUTING.md](modules/core/CONTRIBUTING.md) ve her modülün kendi README'sinde.
