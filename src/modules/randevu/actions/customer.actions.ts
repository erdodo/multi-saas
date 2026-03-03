"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createCustomerSchema, updateCustomerSchema } from "../schemas";
import { logger } from "../lib/logger";
import type { CreateCustomerInput, UpdateCustomerInput } from "../schemas";

export async function getCustomers(tenantId: string, search?: string, page = 1, pageSize = 20) {
  try {
    const where = {
      tenantId,
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName:  { contains: search } },
          { email:     { contains: search } },
          { phone:     { contains: search } },
        ],
      }),
    };

    const [total, customers] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip:    (page - 1) * pageSize,
        take:    pageSize,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { appointments: true } } },
      }),
    ]);

    return {
      success: true,
      data: {
        customers,
        pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      },
    };
  } catch (err) {
    logger.error({ err }, "getCustomers hatası");
    return { success: false, error: "Müşteriler alınırken hata oluştu" };
  }
}

export async function getCustomerById(id: string, tenantId: string) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        appointments: {
          orderBy: { startAt: "desc" },
          take: 20,
          include: {
            service: { select: { name: true } },
            staff:   { select: { name: true } },
          },
        },
      },
    });
    if (!customer) return { success: false, error: "Müşteri bulunamadı" };
    return { success: true, data: customer };
  } catch (err) {
    logger.error({ err }, "getCustomerById hatası");
    return { success: false, error: "Müşteri alınırken hata oluştu" };
  }
}

export async function createCustomer(data: CreateCustomerInput, tenantId: string) {
  try {
    const validated = createCustomerSchema.parse(data);

    if (validated.email) {
      const existing = await prisma.customer.findFirst({
        where: { tenantId, email: validated.email },
      });
      if (existing) return { success: false, error: "Bu e-posta zaten kayıtlı" };
    }

    const customer = await prisma.customer.create({
      data: { ...validated, tenantId },
    });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: customer };
  } catch (err) {
    logger.error({ err }, "createCustomer hatası");
    return { success: false, error: "Müşteri oluşturulurken hata oluştu" };
  }
}

export async function updateCustomer(id: string, data: UpdateCustomerInput, tenantId: string) {
  try {
    const validated = updateCustomerSchema.parse(data);
    const existing = await prisma.customer.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Müşteri bulunamadı" };

    const customer = await prisma.customer.update({ where: { id }, data: validated });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true, data: customer };
  } catch (err) {
    logger.error({ err }, "updateCustomer hatası");
    return { success: false, error: "Müşteri güncellenirken hata oluştu" };
  }
}

export async function deleteCustomer(id: string, tenantId: string) {
  try {
    const existing = await prisma.customer.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Müşteri bulunamadı" };
    await prisma.customer.delete({ where: { id } });
    revalidatePath(`/randevu-panel/dashboard`);
    return { success: true };
  } catch (err) {
    logger.error({ err }, "deleteCustomer hatası");
    return { success: false, error: "Müşteri silinirken hata oluştu" };
  }
}
