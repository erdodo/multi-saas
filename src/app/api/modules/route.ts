import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sistemde bulunması gereken varsayılan modüller
const DEFAULT_MODULES = [
  {
    key: "randevu",
    name: "Randevu Sistemi",
    description:
      "Online randevu yönetimi. Berber, güzellik salonu, doktor ve danışmanlar için.",
  },
  {
    key: "emlak",
    name: "Emlak Sistemi",
    description: "Mülk portföyü yönetimi, sözleşmeler ve kiracı takibi.",
  },
  {
    key: "ders",
    name: "Ders Takip",
    description:
      "Öğrenci devamsızlık ve gelişim takibi. Öğretmenler ve kurs merkezleri için.",
  },
];

export async function GET() {
  // Modüller yoksa otomatik seed et
  const count = await prisma.module.count();
  if (count === 0) {
    await prisma.module.createMany({ data: DEFAULT_MODULES });
  }

  const modules = await prisma.module.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, key: true, name: true, description: true },
  });

  return NextResponse.json(modules);
}
