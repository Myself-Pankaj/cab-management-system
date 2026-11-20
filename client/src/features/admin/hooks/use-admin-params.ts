"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
export function useAdminParams() {
  const params = useSearchParams(),
    router = useRouter(),
    path = usePathname();
  const raw = Number(params.get("offset") ?? 0);
  const offset =
    Number.isInteger(raw) && raw >= 0 && raw <= 2147483647 ? raw : 0;
  function update(values: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === "" || value === 0) next.delete(key);
      else next.set(key, String(value));
    }
    router.push(`${path}${next.size ? `?${next}` : ""}`, { scroll: false });
  }
  return { params, offset, update };
}
