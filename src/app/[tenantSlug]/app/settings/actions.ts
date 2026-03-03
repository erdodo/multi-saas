"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const tenantSchema = z.object({
  name: z.string().min(2, "En az 2 karakter"),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire"),
});

const brandingSchema = z.object({
  siteTitle:      z.string().max(100).optional().nullable(),
  logoUrl:        z.string().url("Geçerli URL giriniz").optional().nullable().or(z.literal("")),
  faviconUrl:     z.string().url("Geçerli URL giriniz").optional().nullable().or(z.literal("")),
  primaryColor:   z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli hex renk"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli hex renk"),
  accentColor:    z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli hex renk"),
  textOnPrimary:  z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli hex renk"),
  fontFamily:     z.enum(["inter", "poppins", "roboto", "system"]),
  borderRadius:   z.enum(["none", "sm", "md", "lg", "full"]),
  darkMode:       z.boolean(),
});

const userSchema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
});

const passwordSchema = z.object({
  current: z.string().min(1),
  next:    z.string().min(6),
});

export async function updateTenantInfo(data: { name: string; slug: string }) {
  const session = await auth();
  if (!session?.user?.tenantId) return { success: false, error: "Yetkisiz" };

  const parsed = tenantSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const conflicting = await prisma.tenant.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: session.user.tenantId } },
  });
  if (conflicting) return { success: false, error: "Bu URL zaten kullanımda" };

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath(`/${parsed.data.slug}/app/settings`);
  return { success: true, slug: parsed.data.slug };
}

export async function updateBranding(data: z.infer<typeof brandingSchema>) {
  const session = await auth();
  if (!session?.user?.tenantId) return { success: false, error: "Yetkisiz" };

  const parsed = brandingSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  // empty string → null
  const sanitized = {
    ...parsed.data,
    logoUrl:    parsed.data.logoUrl    || null,
    faviconUrl: parsed.data.faviconUrl || null,
  };

  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: sanitized,
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { slug: true },
  });

  revalidatePath(`/${tenant?.slug}/app/settings`);
  revalidatePath(`/${tenant?.slug}/app`, "layout");
  return { success: true };
}

export async function updateUserInfo(data: { name: string; email: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Yetkisiz" };

  const parsed = userSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const conflicting = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: session.user.id } },
  });
  if (conflicting) return { success: false, error: "Bu e-posta kullanımda" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  return { success: true };
}

export async function updatePassword(data: { current: string; next: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Yetkisiz" };

  const parsed = passwordSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, error: "Kullanıcı bulunamadı" };

  const valid = await bcrypt.compare(parsed.data.current, user.password);
  if (!valid) return { success: false, error: "Mevcut şifre hatalı" };

  const hashed = await bcrypt.hash(parsed.data.next, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });

  return { success: true };
}

export async function getTenantBranding(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      slug: true,
      siteTitle: true,
      logoUrl: true,
      faviconUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      textOnPrimary: true,
      fontFamily: true,
      borderRadius: true,
      darkMode: true,
    },
  });
}
