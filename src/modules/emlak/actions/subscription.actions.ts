"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

export async function getSubscriptions(tenantId: string, propertyId?: string) {
  try {
    const subscriptions = await prisma.propertySubscription.findMany({
      where: {
        tenantId,
        ...(propertyId ? { propertyId } : {}),
      },
      orderBy: [{ propertyId: "asc" }, { type: "asc" }],
      include: {
        property: { select: { id: true, title: true, address: true } },
      },
    });
    return { success: true, data: subscriptions };
  } catch (err) {
    logger.error("getSubscriptions failed", { err });
    return { success: false, error: "Abonelikler alınamadı" };
  }
}

export async function createSubscription(
  data: CreateSubscriptionInput,
  tenantId: string,
  tenantSlug: string
) {
  try {
    const subscription = await prisma.propertySubscription.create({
      data: {
        ...data,
        tenantId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate:   data.endDate   ? new Date(data.endDate)   : undefined,
      },
    });
    revalidate(tenantSlug);
    return { success: true, data: subscription };
  } catch (err) {
    logger.error("createSubscription failed", { err });
    return { success: false, error: "Abonelik oluşturulamadı" };
  }
}

export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionInput,
  tenantId: string,
  tenantSlug: string
) {
  try {
    const existing = await prisma.propertySubscription.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Abonelik bulunamadı" };

    const subscription = await prisma.propertySubscription.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate:   data.endDate   ? new Date(data.endDate)   : undefined,
      },
    });
    revalidate(tenantSlug);
    return { success: true, data: subscription };
  } catch (err) {
    logger.error("updateSubscription failed", { err, id });
    return { success: false, error: "Abonelik güncellenemedi" };
  }
}

export async function deleteSubscription(id: string, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.propertySubscription.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Abonelik bulunamadı" };
    await prisma.propertySubscription.delete({ where: { id } });
    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("deleteSubscription failed", { err, id });
    return { success: false, error: "Abonelik silinemedi" };
  }
}
