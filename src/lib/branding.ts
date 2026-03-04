import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  darkMode?: boolean;
}

export interface ResolvedBranding {
  name: string;
  siteTitle: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textOnPrimary: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
  /** CSS font-family string ready to use */
  fontStack: string;
  /** CSS border-radius value ready to use */
  radiusPx: string;
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

export const FONT_MAP: Record<string, string> = {
  inter:   "'Inter', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  roboto:  "'Roboto', system-ui, sans-serif",
  system:  "system-ui, sans-serif",
};

export const RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm:   "4px",
  md:   "8px",
  lg:   "16px",
  full: "9999px",
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  primaryColor:   "#3b82f6",
  secondaryColor: "#6366f1",
  accentColor:    "#10b981",
  textOnPrimary:  "#ffffff",
  fontFamily:     "inter",
  borderRadius:   "md",
  darkMode:       false,
} as const;

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getTenantBranding(slug: string): Promise<ResolvedBranding> {
  try {
    const t = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        name:           true,
        siteTitle:      true,
        logoUrl:        true,
        faviconUrl:     true,
        primaryColor:   true,
        secondaryColor: true,
        accentColor:    true,
        textOnPrimary:  true,
        fontFamily:     true,
        borderRadius:   true,
        darkMode:       true,
      },
    });

    const raw = t ?? { name: "App", siteTitle: null, logoUrl: null, faviconUrl: null, ...DEFAULTS };

    const primaryColor   = raw.primaryColor   ?? DEFAULTS.primaryColor;
    const secondaryColor = raw.secondaryColor ?? DEFAULTS.secondaryColor;
    const accentColor    = raw.accentColor    ?? DEFAULTS.accentColor;
    const fontFamily     = raw.fontFamily     ?? DEFAULTS.fontFamily;
    const borderRadius   = raw.borderRadius   ?? DEFAULTS.borderRadius;

    return {
      name:           raw.name ?? "App",
      siteTitle:      raw.siteTitle,
      logoUrl:        raw.logoUrl,
      faviconUrl:     raw.faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      textOnPrimary:  raw.textOnPrimary ?? contrastText(primaryColor),
      fontFamily,
      borderRadius,
      darkMode:       raw.darkMode ?? false,
      fontStack:      FONT_MAP[fontFamily]   ?? FONT_MAP.inter,
      radiusPx:       RADIUS_MAP[borderRadius] ?? RADIUS_MAP.md,
    };
  } catch {
    return {
      name:           "App",
      siteTitle:      null,
      logoUrl:        null,
      faviconUrl:     null,
      ...DEFAULTS,
      fontStack:      FONT_MAP[DEFAULTS.fontFamily],
      radiusPx:       RADIUS_MAP[DEFAULTS.borderRadius],
    };
  }
}

// ─── CSS vars helper ──────────────────────────────────────────────────────────

/** Returns a React.CSSProperties object with all --brand-* custom properties. */
export function brandCssVars(b: ResolvedBranding): React.CSSProperties {
  return {
    "--brand-primary":        b.primaryColor,
    "--brand-secondary":      b.secondaryColor,
    "--brand-accent":         b.accentColor,
    "--brand-text-on-primary": b.textOnPrimary,
    "--brand-font":           b.fontStack,
    "--brand-radius":         b.radiusPx,
    fontFamily:               b.fontStack,
  } as React.CSSProperties;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Calculates contrast text color (dark/light) for a given background hex. */
export function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 155 ? "#0f172a" : "#ffffff";
}

/** Converts hex + alpha to rgba() string. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Produces a darkened version of a hex color by reducing brightness.
 * Used for generating sidebar background from primary brand color.
 * factor: 0 = black, 1 = original
 */
export function darken(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = Math.round(parseInt(h.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * factor);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
