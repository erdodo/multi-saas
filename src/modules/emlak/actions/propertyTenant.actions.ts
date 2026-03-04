"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { CreatePropertyTenantInput, UpdatePropertyTenantInput } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

export async function getPropertyTenants(tenantId: string, search?: string) {
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

    const tenants = await prisma.propertyTenant.findMany({
      where,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        _count: { select: { leases: true } },
        leases: {
          where: { status: "ACTIVE" },
          select: { id: true, property: { select: { title: true } } },
          take: 1,
        },
      },
    });
    return { success: true, data: tenants };
  } catch (err) {
    logger.error("getPropertyTenants failed", { err });
    return { success: false, error: "Kiracılar alınamadı" };
  }
}

export async function getPropertyTenantById(id: string, tenantId: string) {
  try {
    const tenant = await prisma.propertyTenant.findFirst({
      where: { id, tenantId },
      include: {
        leases: {
          include: {
            property: { select: { id: true, title: true, address: true } },
            payments: { orderBy: { dueDate: "desc" }, take: 12 },
          },
          orderBy: { startDate: "desc" },
        },
      },
    });
    if (!tenant) return { success: false, error: "Kiracı bulunamadı" };
    return { success: true, data: tenant };
  } catch (err) {
    logger.error("getPropertyTenantById failed", { err, id });
    return { success: false, error: "Kiracı alınamadı" };
  }
}

export async function createPropertyTenant(
  data: CreatePropertyTenantInput,
  tenantId: string,
  tenantSlug: string
) {
  try {
    const tenant = await prisma.propertyTenant.create({
      data: { ...data, tenantId },
    });
    revalidate(tenantSlug);
    return { success: true, data: tenant };
  } catch (err) {
    logger.error("createPropertyTenant failed", { err });
    return { success: false, error: "Kiracı oluşturulamadı" };
  }
}

export async function updatePropertyTenant(
  id: string,
  data: UpdatePropertyTenantInput,
  tenantId: string,
  tenantSlug: string
) {
  try {
    const existing = await prisma.propertyTenant.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Kiracı bulunamadı" };

    const tenant = await prisma.propertyTenant.update({ where: { id }, data });
    revalidate(tenantSlug);
    return { success: true, data: tenant };
  } catch (err) {
    logger.error("updatePropertyTenant failed", { err, id });
    return { success: false, error: "Kiracı güncellenemedi" };
  }
}

export async function deletePropertyTenant(id: string, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.propertyTenant.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Kiracı bulunamadı" };

    const activeLeases = await prisma.lease.count({
      where: { propertyTenantId: id, status: "ACTIVE" },
    });
    if (activeLeases > 0) {
      return { success: false, error: "Aktif kira sözleşmesi olan kiracı silinemez" };
    }

    await prisma.propertyTenant.delete({ where: { id } });
    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("deletePropertyTenant failed", { err, id });
    return { success: false, error: "Kiracı silinemedi" };
  }
}
