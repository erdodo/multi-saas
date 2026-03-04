"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  createStaffSchema,
  updateStaffSchema,
  setAvailabilitySchema,
  createTimeOffSchema,
  createStaffBreakSchema,
  type CreateStaffInput,
  type UpdateStaffInput,
  type SetAvailabilityInput,
  type CreateTimeOffInput,
  type CreateStaffBreakInput,
} from "../schemas";
import { logger } from "../lib/logger";

// ─── Personel listesi ────────────────────────────────────────────────────────
export async function getStaff(tenantId: string, onlyActive = false) {
  try {
    const staffList = await prisma.staff.findMany({
      where: { tenantId, ...(onlyActive && { isActive: true }) },
      orderBy: { name: "asc" },
      include: {
        staffServices:     { include: { service: true } },
        availabilityRules: { orderBy: { dayOfWeek: "asc" } },
        _count:            { select: { appointments: true } },
        location:          { select: { name: true } },
      },
    });
    return { success: true, data: staffList };
  } catch (err) {
    logger.error({ err }, "getStaff hatası");
    return { success: false, error: "Personel listesi alınırken hata oluştu" };
  }
}

// ─── Personel detayı ─────────────────────────────────────────────────────────
export async function getStaffById(id: string, tenantId: string) {
  try {
    const staff = await prisma.staff.findFirst({
      where: { id, tenantId },
      include: {
        staffServices:     { include: { service: true } },
        availabilityRules: { orderBy: { dayOfWeek: "asc" } },
        timeOffs: {
          where: { endAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
        },
        location: true,
      },
    });
    if (!staff) return { success: false, error: "Personel bulunamadı" };
    return { success: true, data: staff };
  } catch (err) {
    logger.error({ err }, "getStaffById hatası");
    return { success: false, error: "Personel alınırken hata oluştu" };
  }
}

// ─── Personel oluştur ────────────────────────────────────────────────────────
export async function createStaff(data: CreateStaffInput, tenantId: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { serviceIds, availability, email: _email, password: _password, phone: _phone, ...staffData } = createStaffSchema.parse(data);

    const staff = await prisma.$transaction(async (tx) => {
      const s = await tx.staff.create({ data: { ...staffData, tenantId } });
      for (const serviceId of serviceIds) {
        await tx.staffService.create({ data: { staffId: s.id, serviceId } });
      }
      if (availability?.length) {
        for (const rule of availability) {
          await tx.availabilityRule.create({ data: { tenantId, staffId: s.id, ...rule } });
        }
      }
      return s;
    });

    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: staff };
  } catch (err) {
    if (err instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any).issues?.[0]?.message ?? err.message ?? "Geçersiz form verisi";
      return { success: false, error: msg };
    }
    logger.error({ err }, "createStaff hatası");
    return { success: false, error: "Personel oluşturulurken hata oluştu" };
  }
}

// ─── Personel güncelle ───────────────────────────────────────────────────────
export async function updateStaff(id: string, data: UpdateStaffInput, tenantId: string) {
  try {
    const { serviceIds, availability: _a, ...staffData } = updateStaffSchema.parse(data);

    const existing = await prisma.staff.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Personel bulunamadı" };

    const staff = await prisma.$transaction(async (tx) => {
      const s = await tx.staff.update({ where: { id }, data: staffData });
      if (serviceIds !== undefined) {
        await tx.staffService.deleteMany({ where: { staffId: id } });
        for (const serviceId of serviceIds) {
          await tx.staffService.create({ data: { staffId: id, serviceId } });
        }
      }
      return s;
    });

    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: staff };
  } catch (err) {
    logger.error({ err }, "updateStaff hatası");
    return { success: false, error: "Personel güncellenirken hata oluştu" };
  }
}

// ─── Personel sil ────────────────────────────────────────────────────────────
export async function deleteStaff(id: string, tenantId: string) {
  try {
    const existing = await prisma.staff.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Personel bulunamadı" };

    const activeCount = await prisma.appointment.count({
      where: { staffId: id, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (activeCount > 0)
      return { success: false, error: "Aktif randevusu olan personel silinemez" };

    await prisma.staff.delete({ where: { id } });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "deleteStaff hatası");
    return { success: false, error: "Personel silinirken hata oluştu" };
  }
}

// ─── Müsaitlik kurallarını ayarla ────────────────────────────────────────────
export async function setAvailabilityRules(data: SetAvailabilityInput, tenantId: string) {
  try {
    const { staffId, rules } = setAvailabilitySchema.parse(data);

    const staff = await prisma.staff.findFirst({ where: { id: staffId, tenantId } });
    if (!staff) return { success: false, error: "Personel bulunamadı" };

    await prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({ where: { staffId } });
      for (const rule of rules) {
        await tx.availabilityRule.create({ data: { ...rule, staffId, tenantId } });
      }
    });

    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "setAvailabilityRules hatası");
    return { success: false, error: "Müsaitlik kuralları güncellenirken hata oluştu" };
  }
}

// ─── İzin kaydı ekle ────────────────────────────────────────────────────────
export async function createTimeOff(data: CreateTimeOffInput, tenantId: string) {
  try {
    const validated = createTimeOffSchema.parse(data);
    const staff = await prisma.staff.findFirst({ where: { id: validated.staffId, tenantId } });
    if (!staff) return { success: false, error: "Personel bulunamadı" };

    const timeOff = await prisma.timeOff.create({
      data: {
        ...validated,
        tenantId,
        startAt: new Date(validated.startAt),
        endAt:   new Date(validated.endAt),
      },
    });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: timeOff };
  } catch (err) {
    logger.error({ err }, "createTimeOff hatası");
    return { success: false, error: "İzin kaydı eklenirken hata oluştu" };
  }
}

// ─── Mola ekle ────────────────────────────────────────────────────────────────
export async function createStaffBreak(data: CreateStaffBreakInput, tenantId: string) {
  try {
    const validated = createStaffBreakSchema.parse(data);
    const staff = await prisma.staff.findFirst({ where: { id: validated.staffId, tenantId } });
    if (!staff) return { success: false, error: "Personel bulunamadı" };
    const brk = await prisma.staffBreak.create({ data: { ...validated, tenantId } });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: brk };
  } catch (err) {
    logger.error({ err }, "createStaffBreak hatası");
    return { success: false, error: "Mola eklenirken hata oluştu" };
  }
}

// ─── Mola listesi ──────────────────────────────────────────────────────────────
export async function getStaffBreaks(staffId: string, tenantId: string) {
  try {
    const breaks = await prisma.staffBreak.findMany({
      where: { staffId, tenantId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return { success: true, data: breaks };
  } catch (err) {
    logger.error({ err }, "getStaffBreaks hatası");
    return { success: false, error: "Molalar alınırken hata oluştu" };
  }
}

// ─── Mola sil ────────────────────────────────────────────────────────────────
export async function deleteStaffBreak(id: string, tenantId: string) {
  try {
    const existing = await prisma.staffBreak.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Mola bulunamadı" };
    await prisma.staffBreak.delete({ where: { id } });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "deleteStaffBreak hatası");
    return { success: false, error: "Mola silinirken hata oluştu" };
  }
}
