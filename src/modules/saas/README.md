# SaaS Module
Main entry for multi-tenant SaaS product management.
## Purpose
Central module for managing SaaS products, tenants, and configurations.
## Endpoints
- GET /api/saas: List SaaS products
- POST /api/saas: Add new SaaS product
- PUT /api/saas/:id: Update SaaS config
- DELETE /api/saas/:id: Remove SaaS product
## Data Model
Prisma `Saas` model (fields: id, name, config, ownerId).
