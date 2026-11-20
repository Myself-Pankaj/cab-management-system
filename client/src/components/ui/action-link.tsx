import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";

export function ActionLink({
  href,
  children,
  secondary = false,
  light = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`action-link${secondary ? " action-secondary" : ""}${light ? " action-light" : ""}`}
    >
      {children}
      <Icon name="arrow" width={18} height={18} />
    </Link>
  );
}
