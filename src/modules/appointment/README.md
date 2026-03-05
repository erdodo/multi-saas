# Appointment Module
This module provides appointment management for SaaS users.
## Purpose
Enables scheduling and tracking of appointments across clients.
## Endpoints
- GET /api/appointment: List all appointments
- POST /api/appointment: Create a new appointment
- PUT /api/appointment/:id: Update appointment
- DELETE /api/appointment/:id: Delete appointment
## Data Model
Managed via Prisma `Appointment` model (fields: id, description, date, userId).
