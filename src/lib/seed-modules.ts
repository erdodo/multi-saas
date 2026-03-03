"use server";

import { prisma } from "@/lib/prisma";

const MODULES = [
  {
    key: "randevu",
    name: "Randevu Sistemi",
    description:
      "Online randevu yönetimi. Berber, güzellik salonu, doktor ve danışmanlar için.",
  },
  {
    key: "emlak",
    name: "Emlak Sistemi",
    description:
      "Mülk portföyü yönetimi, sözleşmeler ve kiracı takibi.",
  },
  {
    key: "ders",
    name: "Ders Takip",
    description:
      "Öğrenci devamsızlık ve gelişim takibi. Öğretmenler ve kurs merkezleri için.",
  },
];

export async function seedModules() {
  for (const mod of MODULES) {
    await prisma.module.upsert({
      where: { key: mod.key },
      update: { name: mod.name, description: mod.description, isActive: true },
      create: { ...mod, isActive: true },
    });
  }
  return { success: true };
}
