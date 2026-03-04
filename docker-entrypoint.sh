#!/bin/sh
set -e

echo "🔄 Veritabanı şeması uygulanıyor..."
npx prisma db push --skip-generate

echo "🚀 Uygulama başlatılıyor..."
exec node server.js
