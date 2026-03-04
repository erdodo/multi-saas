#!/bin/sh
set -e

echo "🔄 Veritabanı şeması uygulanıyor..."
node /app/node_modules/prisma/build/index.js db push --skip-generate

echo "🚀 Uygulama başlatılıyor..."
exec node /app/server.js
