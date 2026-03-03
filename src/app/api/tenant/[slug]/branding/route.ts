import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      name: true,
      siteTitle: true,
      logoUrl: true,
      faviconUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      textOnPrimary: true,
      fontFamily: true,
      borderRadius: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json(tenant, {
    headers: {
      // Kısa süreli cache — branding nadiren değişir
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
