"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { CreateLeaseInput, EndLeaseInput } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

/** Sözleşme bitiş tarihine kadar aylık ödeme kayıtlarını üretir */
function generatePaymentSchedule(
  leaseId: string,
  tenantId: string,
  startDate: Date,
  endDate: Date,
  rentAmount: number,
  currency: string,
  paymentDayOfMonth: number
): Array<{ leaseId: string; tenantId: string; dueDate: Date; amount: number; currency: string; status: string }> {
  const payments = [];
  const current = new Date(startDate);
  current.setDate(paymentDayOfMonth);
  // İlk ödeme tarihini başlangıçtan sonraki ilk ödeme gününe ayarla
  if (current < startDate) {
    current.setMonth(current.getMonth() + 1);
  }

  while (current <= endDate) {
    payments.push({
      leaseId,
      tenantId,
      dueDate: new Date(current),
      amount: rentAmount,
      currency,
      status: "PENDING",
    });
    current.setMonth(current.getMonth() + 1);
  }
  return payments;
}

export async function getLeases(tenantId: string, status?: string, propertyId?: string) {
  try {
    const leases = await prisma.lease.findMany({
      where: {
        tenantId,
        ...(status     ? { status }     : {}),
        ...(propertyId ? { propertyId } : {}),
      },
      orderBy: { startDate: "desc" },
      include: {
        property:       { select: { id: true, title: true, address: true, city: true, type: true } },
        propertyTenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        owner:          { select: { id: true, firstName: true, lastName: true } },
        _count:         { select: { payments: true } },
        payments: {
          where: { status: { in: ["PENDING", "OVERDUE"] } },
          select: { id: true, status: true, dueDate: true, amount: true },
          orderBy: { dueDate: "asc" },
          take: 3,
        },
      },
    });
    return { success: true, data: leases };
  } catch (err) {
    logger.error("getLeases failed", { err });
    return { success: false, error: "Sözleşmeler alınamadı" };
  }
}

export async function getLeaseById(id: string, tenantId: string) {
  try {
    const lease = await prisma.lease.findFirst({
      where: { id, tenantId },
      include: {
        property:       true,
        propertyTenant: true,
        owner:          true,
        payments:       { orderBy: { dueDate: "asc" } },
        documents:      { orderBy: { createdAt: "desc" } },
      },
    });
    if (!lease) return { success: false, error: "Sözleşme bulunamadı" };
    return { success: true, data: lease };
  } catch (err) {
    logger.error("getLeaseById failed", { err, id });
    return { success: false, error: "Sözleşme alınamadı" };
  }
}

export async function createLease(data: CreateLeaseInput, tenantId: string, tenantSlug: string) {
  try {
    // Mülkün aktif sözleşmesi var mı kontrol et
    const existing = await prisma.lease.findFirst({
      where: { propertyId: data.propertyId, status: "ACTIVE" },
    });
    if (existing) {
      return { success: false, error: "Bu mülkün zaten aktif bir kira sözleşmesi var" };
    }

    const startDate = new Date(data.startDate);
    const endDate   = new Date(data.endDate);

    const { propertyTenantId, ownerId, paymentDayOfMonth, ...rest } = data;

    const lease = await prisma.$transaction(async (tx) => {
      const newLease = await tx.lease.create({
        data: {
          ...rest,
          tenantId,
          propertyTenantId,
          ownerId: ownerId ?? null,
          paymentDayOfMonth,
          startDate,
          endDate,
        },
      });

      // Tüm sözleşme boyunca aylık ödeme takvimini oluştur
      const schedule = generatePaymentSchedule(
        newLease.id,
        tenantId,
        startDate,
        endDate,
        data.rentAmount,
        data.currency ?? "TRY",
        paymentDayOfMonth ?? 1
      );

      if (schedule.length > 0) {
        await tx.leasePayment.createMany({ data: schedule });
      }

      // Mülk durumunu "RENTED" olarak güncelle
      await tx.property.update({
        where: { id: data.propertyId },
        data: { status: "RENTED" },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          action: "CREATE",
          entityType: "Lease",
          entityId: newLease.id,
          newValue: JSON.stringify({ propertyId: data.propertyId, rentAmount: data.rentAmount }),
        },
      });

      return newLease;
    });

    revalidate(tenantSlug);
    return { success: true, data: lease };
  } catch (err) {
    logger.error("createLease failed", { err });
    return { success: false, error: "Sözleşme oluşturulamadı" };
  }
}

export async function endLease(input: EndLeaseInput, tenantId: string, tenantSlug: string) {
  try {
    const lease = await prisma.lease.findFirst({ where: { id: input.leaseId, tenantId } });
    if (!lease) return { success: false, error: "Sözleşme bulunamadı" };
    if (lease.status !== "ACTIVE") return { success: false, error: "Sözleşme zaten aktif değil" };

    await prisma.$transaction(async (tx) => {
      await tx.lease.update({
        where: { id: input.leaseId },
        data: {
          status: input.status,
          terminationReason: input.terminationReason ?? null,
          depositReturnDate: input.depositReturnDate ? new Date(input.depositReturnDate) : null,
        },
      });

      // Bekleyen ödemeleri iptal et
      await tx.leasePayment.updateMany({
        where: { leaseId: input.leaseId, status: "PENDING" },
        data: { status: "OVERDUE" },
      });

      // Mülk durumunu "AVAILABLE" yap
      await tx.property.update({
        where: { id: lease.propertyId },
        data: { status: "AVAILABLE" },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          action: "UPDATE",
          entityType: "Lease",
          entityId: input.leaseId,
          newValue: JSON.stringify({ status: input.status }),
        },
      });
    });

    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("endLease failed", { err });
    return { success: false, error: "Sözleşme sonlandırılamadı" };
  }
}
