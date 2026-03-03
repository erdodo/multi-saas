"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "../schemas";
import { logger } from "../lib/logger";

export async function getServices(tenantId: string, onlyActive = false) {
  try {
    const services = await prisma.service.findMany({
      where: { tenantId, ...(onlyActive && { isActive: true }) },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { appointments: true } },
        staffServices: { select: { staffId: true } },
      },
    });
    return { success: true, data: services };
  } catch (err) {
    logger.error({ err }, "getServices hatası");
    return { success: false, error: "Hizmetler alınırken hata oluştu" };
  }
}

export async function getServiceById(id: string, tenantId: string) {
  try {
    const service = await prisma.service.findFirst({
      where: { id, tenantId },
      include: {
        staffServices: { include: { staff: true } },
        _count: { select: { appointments: true } },
      },
    });
    if (!service) return { success: false, error: "Hizmet bulunamadı" };
    return { success: true, data: service };
  } catch (err) {
    logger.error({ err }, "getServiceById hatası");
    return { success: false, error: "Hizmet alınırken hata oluştu" };
  }
}

export async function createService(data: CreateServiceInput, tenantId: string) {
  try {
    const validated = createServiceSchema.parse(data);
    const service = await prisma.service.create({
      data: { ...validated, tenantId },
    });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: service };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "createService hatası");
    return { success: false, error: process.env.NODE_ENV === "development" ? msg : "Hizmet oluşturulurken hata oluştu" };
  }
}

export async function updateService(id: string, data: UpdateServiceInput, tenantId: string) {
  try {
    const validated = updateServiceSchema.parse(data);
    const existing = await prisma.service.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Hizmet bulunamadı" };

    const service = await prisma.service.update({ where: { id }, data: validated });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: service };
  } catch (err) {
    logger.error({ err }, "updateService hatası");
    return { success: false, error: "Hizmet güncellenirken hata oluştu" };
  }
}

export async function deleteService(id: string, tenantId: string) {
  try {
    const existing = await prisma.service.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Hizmet bulunamadı" };

    // Aktif randevusu var mı?
    const activeCount = await prisma.appointment.count({
      where: { serviceId: id, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (activeCount > 0)
      return { success: false, error: "Aktif randevusu olan hizmet silinemez" };

    await prisma.service.delete({ where: { id } });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "deleteService hatası");
    return { success: false, error: "Hizmet silinirken hata oluştu" };
  }
}
