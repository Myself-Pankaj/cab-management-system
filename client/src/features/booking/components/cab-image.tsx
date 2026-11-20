"use client";
import Image from "next/image";
import { useState } from "react";
export function CabImage({ src, name }: { src?: string | null; name: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const remote = src?.startsWith("https://") && failed !== src ? src : null;
  // Admin-provided images load directly in the browser; the server never fetches arbitrary URLs.
  return (
    <div className="cab-image">
      <Image
        src={remote || "/images/safar-car.jpg"}
        alt={`${name} category illustration; actual vehicle may differ`}
        fill
        sizes="(max-width: 760px) 100vw, 50vw"
        unoptimized={Boolean(remote)}
        onError={() => setFailed(src ?? null)}
      />
    </div>
  );
}
