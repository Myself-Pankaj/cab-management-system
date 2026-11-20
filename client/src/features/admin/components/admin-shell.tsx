"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/store/api/enhanced-api";
import { useSession } from "@/features/auth/hooks/use-session";
import { apiErrorMessage } from "@/features/auth/api-error";
const navigation = [
  ["Overview", "/admin"],
  ["Verifications", "/admin/verifications"],
  ["Rides", "/admin/rides"],
  ["Drivers", "/admin/drivers"],
  ["Vehicles", "/admin/vehicles"],
  ["Users", "/admin/users"],
  ["Payments", "/admin/payments"],
  ["Cab Settings", "/admin/cabs"],
] as const;
export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  // Pages own their access gates so route segments remain visible to Next.js validation.
  return <AdminFrame key={path}>{children}</AdminFrame>;
}
function AdminFrame({ children }: { children: ReactNode }) {
  const path = usePathname(),
    router = useRouter(),
    session = useSession();
  const drawer = useRef<HTMLDialogElement>(null);
  const [logout, state] = useLogoutMutation();
  const lock = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = drawer.current;
    return () => {
      dialog?.close();
    };
  }, []);
  async function signOut() {
    if (lock.current) return;
    lock.current = true;
    try {
      await logout().unwrap();
      router.replace("/login");
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      lock.current = false;
    }
  }
  const links = (
    <nav aria-label="Admin navigation">
      {navigation.map(([label, href], i) => (
        <Link
          key={href}
          href={href}
          onClick={() => drawer.current?.close()}
          aria-current={
            (href === "/admin" ? path === href : path.startsWith(href))
              ? "page"
              : undefined
          }
        >
          <span className="admin-nav-number" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          {label}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          Safar<span>Cab Management</span>
        </Link>
        <p className="admin-nav-label">Administration</p>
        {links}
        <Link className="admin-site-link" href="/">
          Visit website ↗
        </Link>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            onClick={() => drawer.current?.showModal()}
            aria-label="Open admin navigation"
          >
            ☰ Menu
          </button>
          <span className="admin-context">
            Admin /{" "}
            {navigation.find(([, href]) =>
              href === "/admin" ? path === href : path.startsWith(href),
            )?.[0] ?? "Details"}
          </span>
          <div className="admin-account">
            <Link href="/profile">{session.user?.full_name ?? "Account"}</Link>
            <button disabled={state.isLoading} onClick={() => void signOut()}>
              {state.isLoading ? "Signing out…" : "Log out"}
            </button>
          </div>
        </header>
        {error && <p role="alert">{error}</p>}
        <div className="admin-content">{children}</div>
      </div>
      <dialog ref={drawer} className="admin-drawer">
        <div className="admin-drawer-heading">
          <strong>Cab Management</strong>
          <button
            aria-label="Close navigation"
            onClick={() => drawer.current?.close()}
          >
            ✕
          </button>
        </div>
        {links}
        <Link href="/">Visit website ↗</Link>
      </dialog>
    </div>
  );
}
