"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { CreatePropertyInput, UpdatePropertyInput, PropertyQuery } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

export async function getProperties(tenantId: string, query: PropertyQuery = { page: 1, limit: 20 }) {
  try {
    const { page, limit, search, status, type, city, ownerId } = query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(status  ? { status }  : {}),
      ...(type    ? { type }    : {}),
      ...(city    ? { city: { contains: city } } : {}),
      ...(ownerId ? { ownerId } : {}),
      ...(search  ? {
        OR: [
          { title:   { contains: search } },
          { address: { contains: search } },
          { city:    { contains: search } },
          { district:{ contains: search } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner:  { select: { id: true, firstName: true, lastName: true } },
          leases: { where: { status: "ACTIVE" }, select: { id: true, rentAmount: true, currency: true, endDate: true } },
          photos: { where: { isPrimary: true }, take: 1 },
          _count: { select: { subscriptions: true, documents: true } },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return { success: true, data: { items, total, page, limit } };
  } catch (err) {
    logger.error("getProperties failed", { err });
    return { success: false, error: "Mülkler alınamadı" };
  }
}

export async function getPropertyById(id: string, tenantId: string) {
  try {
    const property = await prisma.property.findFirst({
      where: { id, tenantId },
      include: {
        owner: true,
        leases: {
          include: {
            propertyTenant: true,
            payments: { orderBy: { dueDate: "asc" } },
          },
          orderBy: { startDate: "desc" },
        },
        subscriptions: { orderBy: { type: "asc" } },
        documents:     { orderBy: { createdAt: "desc" } },
        photos:        { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    });
    if (!property) return { success: false, error: "Mülk bulunamadı" };
    return { success: true, data: property };
  } catch (err) {
    logger.error("getPropertyById failed", { err, id });
    return { success: false, error: "Mülk alınamadı" };
  }
}

export async function createProperty(data: CreatePropertyInput, tenantId: string, tenantSlug: string) {
  try {
    const property = await prisma.property.create({
      data: {
        ...data,
        tenantId,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      },
    });
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: "CREATE",
        entityType: "Property",
        entityId: property.id,
        newValue: JSON.stringify({ title: property.title }),
      },
    });
    revalidate(tenantSlug);
    return { success: true, data: property };
  } catch (err) {
    logger.error("createProperty failed", { err });
    return { success: false, error: "Mülk oluşturulamadı" };
  }
}

export async function updateProperty(id: string, data: UpdatePropertyInput, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.property.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Mülk bulunamadı" };

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      },
    });
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: "UPDATE",
        entityType: "Property",
        entityId: id,
        oldValue: JSON.stringify({ title: existing.title, status: existing.status }),
        newValue: JSON.stringify({ title: property.title, status: property.status }),
      },
    });
    revalidate(tenantSlug);
    return { success: true, data: property };
  } catch (err) {
    logger.error("updateProperty failed", { err, id });
    return { success: false, error: "Mülk güncellenemedi" };
  }
}

export async function deleteProperty(id: string, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.property.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Mülk bulunamadı" };

    const activeLeases = await prisma.lease.count({ where: { propertyId: id, status: "ACTIVE" } });
    if (activeLeases > 0) {
      return { success: false, error: "Aktif kira sözleşmesi olan mülk silinemez" };
    }

    await prisma.property.delete({ where: { id } });
    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("deleteProperty failed", { err, id });
    return { success: false, error: "Mülk silinemedi" };
  }
}
