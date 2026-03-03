"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const setupSchema = z.object({
  slug: z
    .string()
    .min(2, "En az 2 karakter olmalıdır")
    .max(50, "En fazla 50 karakter olabilir")
    .regex(
      /^[a-z0-9-]+$/,
      "Sadece küçük harf, rakam ve tire (-) kullanabilirsiniz"
    ),
  modules: z
    .array(z.string())
    .min(1, "En az bir modül seçmelisiniz"),
});

export async function completeSetup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return { success: false, error: "Yetkisiz erişim. Lütfen tekrar giriş yapın." };
  }

  const rawModules = formData.getAll("modules") as string[];
  const raw = {
    slug: (formData.get("slug") as string)?.toLowerCase().trim(),
    modules: rawModules,
  };

  const parsed = setupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  // Slug benzersizliğini kontrol et
  const existing = await prisma.tenant.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing && existing.id !== session.user.tenantId) {
    return {
      success: false,
      error: "Bu URL adresi zaten kullanımda. Lütfen farklı bir tane seçin.",
    };
  }

  // Seçilen modüllerin DB'deki karşılığını bul
  const modules = await prisma.module.findMany({
    where: { key: { in: parsed.data.modules }, isActive: true },
  });

  if (modules.length === 0) {
    return {
      success: false,
      error:
        "Seçilen modüller bulunamadı. Sistem yöneticisiyle iletişime geçin.",
    };
  }

  // Tenant'ı güncelle - slug, setupCompleted ve modüller
  await prisma.tenant.update({
    where: { id: session.user.tenantId },
    data: {
      slug: parsed.data.slug,
      setupCompleted: true,
      tenantModules: {
        deleteMany: {},
        create: modules.map((m) => ({ moduleId: m.id, isActive: true })),
      },
    },
  });

  return { success: true, tenantSlug: parsed.data.slug };
}
