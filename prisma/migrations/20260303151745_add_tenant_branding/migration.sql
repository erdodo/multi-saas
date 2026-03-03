-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "domain" TEXT,
    "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "siteTitle" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#3b82f6',
    "secondaryColor" TEXT DEFAULT '#6366f1',
    "accentColor" TEXT DEFAULT '#10b981',
    "textOnPrimary" TEXT DEFAULT '#ffffff',
    "fontFamily" TEXT DEFAULT 'inter',
    "borderRadius" TEXT DEFAULT 'md',
    "darkMode" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Tenant" ("createdAt", "domain", "id", "name", "setupCompleted", "slug", "updatedAt") SELECT "createdAt", "domain", "id", "name", "setupCompleted", "slug", "updatedAt" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
