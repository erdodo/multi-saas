"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { CreateOwnerInput, UpdateOwnerInput } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

export async function getOwners(tenantId: string, search?: string) {
  try {
    const where = {
      tenantId,
      ...(search ? {
        OR: [
          { firstName: { contains: search } },
          { lastName:  { contains: search } },
          { phone:     { contains: search } },
          { email:     { contains: search } },
          { nationalId:{ contains: search } },
        ],
      } : {}),
    };

    const owners = await prisma.propertyOwner.findMany({
      where,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: { _count: { select: { properties: true } } },
    });
    return { success: true, data: owners };
  } catch (err) {
    logger.error("getOwners failed", { err });
    return { success: false, error: "Mülk sahipleri alınamadı" };
  }
}

export async function getOwnerById(id: string, tenantId: string) {
  try {
    const owner = await prisma.propertyOwner.findFirst({
      where: { id, tenantId },
      include: {
        properties: {
          select: { id: true, title: true, type: true, status: true, city: true },
        },
      },
    });
    if (!owner) return { success: false, error: "Mülk sahibi bulunamadı" };
    return { success: true, data: owner };
  } catch (err) {
    logger.error("getOwnerById failed", { err, id });
    return { success: false, error: "Mülk sahibi alınamadı" };
  }
}

export async function createOwner(data: CreateOwnerInput, tenantId: string, tenantSlug: string) {
  try {
    const owner = await prisma.propertyOwner.create({
      data: { ...data, tenantId },
    });
    revalidate(tenantSlug);
    return { success: true, data: owner };
  } catch (err) {
    logger.error("createOwner failed", { err });
    return { success: false, error: "Mülk sahibi oluşturulamadı" };
  }
}

export async function updateOwner(id: string, data: UpdateOwnerInput, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.propertyOwner.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Mülk sahibi bulunamadı" };

    const owner = await prisma.propertyOwner.update({ where: { id }, data });
    revalidate(tenantSlug);
    return { success: true, data: owner };
  } catch (err) {
    logger.error("updateOwner failed", { err, id });
    return { success: false, error: "Mülk sahibi güncellenemedi" };
  }
}

export async function deleteOwner(id: string, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.propertyOwner.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Mülk sahibi bulunamadı" };

    const propCount = await prisma.property.count({ where: { ownerId: id } });
    if (propCount > 0) {
      return { success: false, error: "Mülkleri olan bir sahip silinemez. Önce mülkleri başka bir sahibe atayın." };
    }

    await prisma.propertyOwner.delete({ where: { id } });
    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("deleteOwner failed", { err, id });
    return { success: false, error: "Mülk sahibi silinemedi" };
  }
}
