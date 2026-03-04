"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "../lib/logger";
import type { CreateDocumentInput, UpdateDocumentInput, CreatePhotoInput } from "../schemas";

const revalidate = (tenantSlug: string) =>
  revalidatePath(`/${tenantSlug}/emlak-panel/dashboard`);

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getDocuments(tenantId: string, propertyId?: string, leaseId?: string) {
  try {
    const docs = await prisma.propertyDocument.findMany({
      where: {
        tenantId,
        ...(propertyId ? { propertyId } : {}),
        ...(leaseId    ? { leaseId }    : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, title: true } },
        lease:    { select: { id: true, startDate: true, endDate: true, property: { select: { title: true } }, propertyTenant: { select: { firstName: true, lastName: true } } } },
      },
    });
    return { success: true, data: docs };
  } catch (err) {
    logger.error("getDocuments failed", { err });
    return { success: false, error: "Belgeler alınamadı" };
  }
}

export async function createDocument(
  data: CreateDocumentInput,
  tenantId: string,
  tenantSlug: string
) {
  try {
    const doc = await prisma.propertyDocument.create({
      data: {
        ...data,
        tenantId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
    revalidate(tenantSlug);
    return { success: true, data: doc };
  } catch (err) {
    logger.error("createDocument failed", { err });
    return { success: false, error: "Belge oluşturulamadı" };
  }
}

export async function updateDocument(
  id: string,
  data: UpdateDocumentInput,
  tenantId: string,
  tenantSlug: string
) {
  try {
    const existing = await prisma.propertyDocument.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Belge bulunamadı" };

    const doc = await prisma.propertyDocument.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
    revalidate(tenantSlug);
    return { success: true, data: doc };
  } catch (err) {
    logger.error("updateDocument failed", { err, id });
    return { success: false, error: "Belge güncellenemedi" };
  }
}

export async function deleteDocument(id: string, tenantId: string, tenantSlug: string) {
  try {
    const existing = await prisma.propertyDocument.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false, error: "Belge bulunamadı" };
    await prisma.propertyDocument.delete({ where: { id } });
    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("deleteDocument failed", { err, id });
    return { success: false, error: "Belge silinemedi" };
  }
}

// ─── Photos ──────────────────────────────────────────────────────────────────

export async function addPhoto(data: CreatePhotoInput, tenantSlug: string) {
  try {
    // Eğer isPrimary ise mevcut primary'leri kaldır
    if (data.isPrimary) {
      await prisma.propertyPhoto.updateMany({
        where: { propertyId: data.propertyId, isPrimary: true },
        data: { isPrimary: false },
      });
    }
    const photo = await prisma.propertyPhoto.create({ data });
    revalidate(tenantSlug);
    return { success: true, data: photo };
  } catch (err) {
    logger.error("addPhoto failed", { err });
    return { success: false, error: "Fotoğraf eklenemedi" };
  }
}

export async function deletePhoto(id: string, propertyId: string, tenantSlug: string) {
  try {
    await prisma.propertyPhoto.deleteMany({ where: { id, propertyId } });
    revalidate(tenantSlug);
    return { success: true };
  } catch (err) {
    logger.error("deletePhoto failed", { err, id });
    return { success: false, error: "Fotoğraf silinemedi" };
  }
}
