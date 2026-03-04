"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "../lib/logger";

export async function getDashboardStats(tenantId: string) {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Gecikmiş PENDING ödemeleri otomatik OVERDUE'ye çek
    await prisma.leasePayment.updateMany({
      where: { tenantId, status: "PENDING", dueDate: { lt: today } },
      data: { status: "OVERDUE" },
    });

    const [
      totalProperties,
      propertiesByStatus,
      activeLeases,
      thisMonthPayments,
      overduePayments,
      expiringLeases,
      recentPayments,
    ] = await Promise.all([
      // Toplam mülk sayısı
      prisma.property.count({ where: { tenantId, isActive: true } }),

      // Mülk durumlarına göre dağılım
      prisma.property.groupBy({
        by: ["status"],
        where: { tenantId, isActive: true },
        _count: true,
      }),

      // Aktif sözleşme sayısı
      prisma.lease.count({ where: { tenantId, status: "ACTIVE" } }),

      // Bu ay beklenen ödemeler (PENDING + PAID)
      prisma.leasePayment.findMany({
        where: {
          tenantId,
          dueDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          },
          status: { in: ["PENDING", "PAID", "PARTIAL", "OVERDUE"] },
        },
        select: { status: true, amount: true, paidAmount: true, dueDate: true },
      }),

      // Gecikmiş ödemeler
      prisma.leasePayment.findMany({
        where: { tenantId, status: "OVERDUE" },
        orderBy: { dueDate: "asc" },
        take: 10,
        include: {
          lease: {
            select: {
              property:       { select: { id: true, title: true } },
              propertyTenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),

      // Önümüzdeki 60 gün içinde biten sözleşmeler
      prisma.lease.findMany({
        where: {
          tenantId,
          status: "ACTIVE",
          endDate: {
            gte: now,
            lte: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { endDate: "asc" },
        take: 10,
        include: {
          property:       { select: { id: true, title: true } },
          propertyTenant: { select: { id: true, firstName: true, lastName: true } },
        },
      }),

      // Son 10 ödeme
      prisma.leasePayment.findMany({
        where: { tenantId, status: "PAID" },
        orderBy: { paidAt: "desc" },
        take: 10,
        include: {
          lease: {
            select: {
              property: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    // Bu ay istatistikleri
    const thisMonthExpected = thisMonthPayments.reduce((s, p) => s + p.amount, 0);
    const thisMonthCollected = thisMonthPayments
      .filter(p => p.status === "PAID" || p.status === "PARTIAL")
      .reduce((s, p) => s + (p.paidAmount ?? p.amount), 0);
    const overdueTotal = overduePayments.reduce((s, p) => s + p.amount, 0);

    // Status dağılımı map
    const statusMap: Record<string, number> = {};
    for (const g of propertiesByStatus) {
      statusMap[g.status] = g._count;
    }

    return {
      success: true,
      data: {
        totalProperties,
        availableProperties: statusMap["AVAILABLE"] ?? 0,
        rentedProperties:    statusMap["RENTED"]    ?? 0,
        activeLeases,
        thisMonthExpected,
        thisMonthCollected,
        overdueCount:  overduePayments.length,
        overdueTotal,
        expiringLeases,
        overduePayments,
        recentPayments,
      },
    };
  } catch (err) {
    logger.error("getDashboardStats failed", { err });
    return { success: false, error: "İstatistikler alınamadı" };
  }
}
