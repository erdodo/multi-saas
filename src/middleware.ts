import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!session?.user;
  const setupCompleted = session?.user?.setupCompleted ?? false;
  const tenantSlug = session?.user?.tenantSlug ?? null;

  // Giriş yapılmışsa yönlendireceğimiz ana URL
  const appHome = tenantSlug ? `/${tenantSlug}/app` : "/setup";

  // /:tenant/app/** - oturum + setup tamamlanmış olmalı
  const tenantAppMatch = pathname.match(/^\/([^/]+)\/app(\/.*)?$/);
  if (tenantAppMatch) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (!setupCompleted) {
      return NextResponse.redirect(new URL("/setup", req.nextUrl));
    }
    // Yanlış tenant slug ile erişim varsa doğru slug'a yönlendir
    const urlTenantSlug = tenantAppMatch[1];
    if (tenantSlug && urlTenantSlug !== tenantSlug) {
      const rest = tenantAppMatch[2] ?? "";
      return NextResponse.redirect(new URL(`/${tenantSlug}/app${rest}`, req.nextUrl));
    }
    return NextResponse.next();
  }

  // /:tenant/emlak-panel/** - oturum + setup tamamlanmış olmalı
  const emlakPanelMatch = pathname.match(/^\/([^/]+)\/emlak-panel(\/.*)?$/);
  if (emlakPanelMatch) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (!setupCompleted) {
      return NextResponse.redirect(new URL("/setup", req.nextUrl));
    }
    const urlTenantSlug = emlakPanelMatch[1];
    if (tenantSlug && urlTenantSlug !== tenantSlug) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/emlak-panel/dashboard`, req.nextUrl));
    }
    return NextResponse.next();
  }

  // Eski /app/** yollarını yeni yapıya yönlendir
  if (pathname.startsWith("/app")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (!setupCompleted) {
      return NextResponse.redirect(new URL("/setup", req.nextUrl));
    }
    // /app/randevu → /{slug}/app/randevu şeklinde yönlendir
    const rest = pathname.slice(4); // "/app" sonrasını al
    return NextResponse.redirect(new URL(`${appHome}${rest}`, req.nextUrl));
  }

  // /setup - oturum gerekli, setup zaten tamamsa uygulama'ya yönlendir
  if (pathname === "/setup") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (setupCompleted) {
      return NextResponse.redirect(new URL(appHome, req.nextUrl));
    }
    return NextResponse.next();
  }

  // /login, /register - zaten girişliyse yönlendir
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      if (!setupCompleted) {
        return NextResponse.redirect(new URL("/setup", req.nextUrl));
      }
      return NextResponse.redirect(new URL(appHome, req.nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/:tenantSlug/app/:path*",
    "/:tenantSlug/emlak-panel/:path*",
    "/:tenantSlug/randevu-panel/:path*",
    "/app/:path*",
    "/setup",
    "/login",
    "/register",
  ],
};
