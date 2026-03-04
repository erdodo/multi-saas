# ---- deps aşaması ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile || npm install

# ---- build aşaması ----
# next build → .next/standalone/server.js (next start veya next dev KULLANILMAZ)
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build sırasında geçici bir DATABASE_URL tanımla (sadece schema generate için)
ENV DATABASE_URL="postgresql://postgresql:postgresql@localhost:5432/postgresql"
ENV NEXTAUTH_SECRET="build-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
# next build --webpack → output:standalone → .next/standalone/server.js oluşturur
RUN npm run build

# ---- production aşaması ----
# next start / next dev ÇALIŞMAZ.
# Yalnızca compiled standalone output: node server.js
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl

# Önce standalone output (kendi minimal node_modules'ıyla gelir)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prisma paketlerini standalone'un node_modules'ının ÜSTÜNE kopyala
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Başlangıç scripti
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
