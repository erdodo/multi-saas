# ---- deps aşaması ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile || npm install

# ---- build aşaması ----
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
RUN npm run build

# ---- production aşaması ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Gerekli sistem araçları
RUN apk add --no-cache libc6-compat

# Prisma binary'leri için gerekli
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Next.js build çıktısı
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Başlangıç scripti
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
