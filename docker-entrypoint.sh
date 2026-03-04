#!/bin/sh
set -e

echo "[prod] Veritabanı şeması uygulanıyor (prisma db push)..."
node /app/node_modules/prisma/build/index.js db push --skip-generate

echo "[prod] Uygulama başlatılıyor → node /app/server.js (Next.js standalone build, next start/dev kullanılmıyor)"
exec node /app/server.js
