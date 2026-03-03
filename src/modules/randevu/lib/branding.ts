export interface TenantBranding {
  name: string;
  siteTitle: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  textOnPrimary: string | null;
  fontFamily: string | null;
  borderRadius: string | null;
}

const DEFAULT_BRANDING: TenantBranding = {
  name: "Randevu",
  siteTitle: null,
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#3b82f6",
  secondaryColor: "#6366f1",
  accentColor: "#10b981",
  textOnPrimary: "#ffffff",
  fontFamily: "inter",
  borderRadius: "md",
};

/** Tenant branding verilerini veri tabanından getirir. */
export async function getTenantBranding(slug: string): Promise<TenantBranding> {
  try {
    // Aynı Next.js projesi içinde olduğumuzdan doğrudan prisma kullanıyoruz.
    const { prisma } = await import("@/lib/prisma");
    const t = await prisma.tenant.findUnique({
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
    if (!t) return DEFAULT_BRANDING;
    return { ...DEFAULT_BRANDING, ...t };
  } catch {
    return DEFAULT_BRANDING;
  }
}

/** #rrggbb hex → luminance hesabı ile kontrast metin rengi */
export function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 155 ? "#0f172a" : "#ffffff";
}

/** hex + alpha → rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
