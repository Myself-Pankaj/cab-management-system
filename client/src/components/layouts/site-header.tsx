"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disclosure } from "@heroui/react";
import { Brand } from "@/components/shared/brand";
import { Icon } from "@/components/ui/icon";
import { AccountNavigation } from "@/features/auth/components/account-navigation";
import { useSession } from "@/features/auth/hooks/use-session";
import { routes } from "@/lib/routes";

const navigation = [
  { label: "Home", href: routes.home },
  { label: "About us", href: routes.about },
];

export function SiteHeader() {
  const pathname = usePathname();
  const session = useSession();
  const links =
    session.status === "authenticated" && session.user?.global_role === "Admin"
      ? [...navigation, { label: "Admin dashboard", href: routes.admin }]
      : navigation;
  const navLinks = links.map(({ label, href }) => (
    <Link
      key={href}
      href={href}
      className="nav-link"
      aria-current={pathname === href ? "page" : undefined}
    >
      {label}
    </Link>
  ));
  return (
    <header className="site-header">
      <div className="header-inner page-width">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks}
        </nav>
        <div className="desktop-account">
          <AccountNavigation />
        </div>
        <Disclosure className="mobile-navigation" key={pathname}>
          <Disclosure.Heading>
            <Disclosure.Trigger
              className="mobile-menu-trigger"
              aria-label="Toggle navigation menu"
            >
              <Icon name="menu" />
              <span>Menu</span>
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content className="mobile-menu">
            <nav aria-label="Mobile navigation">
              {navLinks}
              <AccountNavigation />
            </nav>
          </Disclosure.Content>
        </Disclosure>
      </div>
    </header>
  );
}
