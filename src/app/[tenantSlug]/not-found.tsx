"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const tenantSlug = segments[0];
    if (tenantSlug) {
      router.replace(`/${tenantSlug}/app`);
    } else {
      router.replace("/");
    }
  }, [pathname, router]);

  return null;
}
