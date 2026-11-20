import type { SVGProps } from "react";

const paths = {
  notice: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  bag: <><rect x="5" y="6" width="14" height="15" rx="3" /><path d="M9 6V3h6v3M9 10v7m6-7v7" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20M6 15h3" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 8V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V7" />
      <path d="M20 12h-5v4h5M17 14h.01" />
    </>
  ),
  split: (
    <>
      <path d="M12 21v-7a6 6 0 0 0-6-6H3m0 0 4-4M3 8l4 4M12 14a6 6 0 0 1 6-6h3m0 0-4-4m4 4-4 4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 18h4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  car: (
    <>
      <path d="m5 9 2-5h10l2 5M4 9h16l1 3v6H3v-6l1-3Zm1 9v2m14-2v2M6 13h2m8 0h2" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  diagonal: <path d="M6 18 18 6M6 6h12v12" />,
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C7 2 2 10 6 16s15 2 14-12ZM5 20 16 9" />
      <path d="M10 14v-4m0 4h5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="m3 3 18 18M10.5 5.1 12 5c6 0 10 7 10 7a19 19 0 0 1-3 3.7M6.2 6.2A23 23 0 0 0 2 12s4 7 10 7a11 11 0 0 0 5.8-1.8M10 10a3 3 0 0 0 4 4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
} as const;

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
