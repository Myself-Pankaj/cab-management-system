"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
export function AppChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  const admin = path === "/admin" || path.startsWith("/admin/");
  return (
    <>
      {!admin && <SiteHeader />}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      {!admin && <SiteFooter />}
    </>
  );
}
