import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function MetricCard({ label, value, detail, href }: { label: string; value: ReactNode; detail: string; href?: string }) {
  const content = <><span className="ui-metric-label">{label}{href && <Icon name="diagonal" width={16} height={16} />}</span><strong>{value}</strong><small>{detail}</small></>;
  return href ? <Link href={href} className="ui-metric">{content}</Link> : <article className="ui-metric">{content}</article>;
}
