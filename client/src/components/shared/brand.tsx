import Link from "next/link";
import { routes } from "@/lib/routes";

export function Brand() {
  return (
    <Link href={routes.home} className="brand" aria-label="Safar Cabs home">
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 32 40" fill="none">
          <path
            d="M22 4C9-1 2 10 11 16l10 7c9 7 1 17-11 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M18 1 10 39"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
        </svg>
      </span>
      <span className="brand-name">
        safar<span className="brand-category">CABS & JOURNEYS</span>
      </span>
    </Link>
  );
}
