"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { MarkPaymentPaidInput } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

export async function getPayments(
  tenantId: string,
  opts: { leaseId?: string; status?: string; month?: number; year?: number } = {}
) {
  try {
    const { leaseId, status, month, year } = opts;

    const where: Record<string, unknown> = { tenantId };
    if (leaseId) where.leaseId = leaseId;
    if (status)  where.status  = status;
    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      where.dueDate = { gte: start, lte: end };
    }

    const payments = await prisma.leasePayment.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      orderBy: { dueDate: "asc" },
      include: {
        lease: {
          select: {
            id: true,
            property:       { select: { id: true, title: true } },
            propertyTenant: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    return { success: true, data: payments };
  } catch (err) {
    logger.error("getPayments failed", { err });
    return { success: false, error: "Ödemeler alınamadı" };
  }
}

export async function getOverduePayments(tenantId: string) {
  try {
    const now = new Date();
    // PENDING + vadesi geçmiş → OVERDUE'ye güncelle
    await prisma.leasePayment.updateMany({
      where: {
        tenantId,
        status: "PENDING",
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });

    const payments = await prisma.leasePayment.findMany({
      where: { tenantId, status: "OVERDUE" },
      orderBy: { dueDate: "asc" },
      include: {
        lease: {
          select: {
            property:       { select: { id: true, title: true } },
            propertyTenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });
    return { success: true, data: payments };
  } catch (err) {
    logger.error("getOverduePayments failed", { err });
    return { success: false, error: "Gecikmiş ödemeler alınamadı" };
  }
}

export async function markPaymentPaid(input: MarkPaymentPaidInput, tenantId: string, tenantSlug: string) {
  try {
    const payment = await prisma.leasePayment.findFirst({
      where: { id: input.paymentId, tenantId },
    });
    if (!payment) return { success: false, error: "Ödeme kaydı bulunamadı" };

    const isPartial = input.paidAmount < payment.amount;
    const updated = await prisma.leasePayment.update({
      where: { id: input.paymentId },
      data: {
        paidAmount:    input.paidAmount,
        paidAt:        new Date(input.paidAt),
        paymentMethod: input.paymentMethod ?? null,
        receiptNo:     input.receiptNo ?? null,
        notes:         input.notes ?? null,
        status:        isPartial ? "PARTIAL" : "PAID",
      },
    });

    revalidate(tenantSlug);
    return { success: true, data: updated };
  } catch (err) {
    logger.error("markPaymentPaid failed", { err });
    return { success: false, error: "Ödeme işaretlenemedi" };
  }
}

export async function getUpcomingPayments(tenantId: string, days = 30) {
  try {
    const now   = new Date();
    const until = new Date();
    until.setDate(until.getDate() + days);

    const payments = await prisma.leasePayment.findMany({
      where: {
        tenantId,
        status:  { in: ["PENDING"] },
        dueDate: { gte: now, lte: until },
      },
      orderBy: { dueDate: "asc" },
      include: {
        lease: {
          select: {
            property:       { select: { id: true, title: true } },
            propertyTenant: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    return { success: true, data: payments };
  } catch (err) {
    logger.error("getUpcomingPayments failed", { err });
    return { success: false, error: "Yaklaşan ödemeler alınamadı" };
  }
}
