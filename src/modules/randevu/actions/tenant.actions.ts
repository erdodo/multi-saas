"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateTenantSettingsSchema, createHolidaySchema } from "../schemas";
import { logger } from "../lib/logger";
import type { UpdateTenantSettingsInput } from "../schemas";

// ─── Tenant ayarları ──────────────────────────────────────────────────────────
export async function getTenantSettings(tenantId: string) {
  try {
    let settings = await prisma.tenantSettings.findUnique({ where: { tenantId } });
    if (!settings) {
      settings = await prisma.tenantSettings.create({ data: { tenantId } });
    }
    return { success: true, data: settings };
  } catch (err) {
    logger.error({ err }, "getTenantSettings hatası");
    return { success: false, error: "Ayarlar alınırken hata oluştu" };
  }
}

export async function updateTenantSettings(data: UpdateTenantSettingsInput, tenantId: string) {
  try {
    const validated = updateTenantSettingsSchema.parse(data);
    const settings = await prisma.tenantSettings.upsert({
      where:  { tenantId },
      update: validated,
      create: { tenantId, ...validated },
    });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: settings };
  } catch (err) {
    logger.error({ err }, "updateTenantSettings hatası");
    return { success: false, error: "Ayarlar güncellenirken hata oluştu" };
  }
}

// ─── Tatil/Kapalı günler ──────────────────────────────────────────────────────
export async function getHolidays(tenantId: string) {
  try {
    const holidays = await prisma.holiday.findMany({
      where:   { tenantId },
      orderBy: { date: "asc" },
    });
    return { success: true, data: holidays };
  } catch (err) {
    logger.error({ err }, "getHolidays hatası");
    return { success: false, error: "Tatil günleri alınırken hata oluştu" };
  }
}

export async function createHoliday(data: { name: string; date: string }, tenantId: string) {
  try {
    const validated = createHolidaySchema.parse(data);
    const holiday = await prisma.holiday.create({
      data: { ...validated, date: new Date(validated.date), tenantId },
    });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: holiday };
  } catch (err) {
    logger.error({ err }, "createHoliday hatası");
    return { success: false, error: "Tatil günü eklenirken hata oluştu" };
  }
}

export async function deleteHoliday(id: string, tenantId: string) {
  try {
    const existing = await prisma.holiday.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Tatil günü bulunamadı" };
    await prisma.holiday.delete({ where: { id } });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "deleteHoliday hatası");
    return { success: false, error: "Tatil günü silinirken hata oluştu" };
  }
}

// ─── Raporlama ────────────────────────────────────────────────────────────────
export async function getReports(tenantId: string, from: Date, to: Date) {
  try {
    const [allAppointments, byService, byStaff, noShowCount] =
      await prisma.$transaction([
        prisma.appointment.groupBy({
          by:      ["status"],
          where:   { tenantId, startAt: { gte: from, lte: to } },
          _count:  { _all: true },
          orderBy: { status: "asc" },
        }),
        prisma.appointment.groupBy({
          by:      ["serviceId"],
          where:   { tenantId, startAt: { gte: from, lte: to } },
          _count:  { _all: true },
          orderBy: { serviceId: "asc" },
        }),
        prisma.appointment.groupBy({
          by:      ["staffId"],
          where:   { tenantId, startAt: { gte: from, lte: to } },
          _count:  { _all: true },
          orderBy: { staffId: "asc" },
        }),
        prisma.appointment.count({
          where: { tenantId, startAt: { gte: from, lte: to }, status: "NO_SHOW" },
        }),
      ]);

    const completedAppointments = await prisma.appointment.findMany({
      where:   { tenantId, startAt: { gte: from, lte: to }, status: "COMPLETED" },
      include: { service: { select: { price: true, name: true } } },
    });

    const totalRevenue = completedAppointments.reduce(
      (sum, a) => sum + Number(a.service.price),
      0
    );

    const serviceIds = byService.map((s) => s.serviceId);
    const staffIds   = byStaff.map((s) => s.staffId);

    const [serviceDetails, staffDetails] = await prisma.$transaction([
      prisma.service.findMany({
        where:  { id: { in: serviceIds } },
        select: { id: true, name: true },
      }),
      prisma.staff.findMany({
        where:  { id: { in: staffIds } },
        select: { id: true, name: true },
      }),
    ]);

    const serviceMap = Object.fromEntries(serviceDetails.map((s) => [s.id, s.name]));
    const staffMap   = Object.fromEntries(staffDetails.map((s) => [s.id, s.name]));

    return {
      success: true,
      data: {
        statusBreakdown: allAppointments.map((r) => ({
          status: r.status,
          count:  (r._count as { _all: number })._all,
        })),
        byService: byService.map((r) => ({
          serviceId:   r.serviceId,
          serviceName: serviceMap[r.serviceId] ?? r.serviceId,
          count:       (r._count as { _all: number })._all,
        })),
        byStaff: byStaff.map((r) => ({
          staffId:   r.staffId,
          staffName: staffMap[r.staffId] ?? r.staffId,
          count:     (r._count as { _all: number })._all,
        })),
        noShowCount,
        totalRevenue,
      },
    };
  } catch (err) {
    logger.error({ err }, "getReports hatası");
    return { success: false, error: "Rapor oluşturulurken hata oluştu" };
  }
}
