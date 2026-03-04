#!/bin/sh
set -e

echo "🔄 Veritabanı şeması uygulanıyor..."
node node_modules/prisma/bin.js db push --skip-generate

echo "🚀 Uygulama başlatılıyor..."
exec node server.js
