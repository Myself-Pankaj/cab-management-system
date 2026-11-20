"use client";
import Link from "next/link";
import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { useSession } from "../hooks/use-session";
import { useLogoutMutation } from "@/store/api/enhanced-api";
import { notifyUnexpectedRequestError } from "../api-error";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";

export function AccountNavigation() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [logout, logoutState] = useLogoutMutation();
  const lock = useRef(false);
  async function signOut() {
    if (lock.current) return;
    lock.current = true;
    try {
      await logout().unwrap();
      router.replace(routes.login);
    } catch (error) {
      notifyUnexpectedRequestError(error);
    } finally {
      lock.current = false;
      logoutState.reset();
    }
  }
  if (session.status === "unknown")
    return (
      <div className="account-navigation">
        {session.error ? (
          <Button
            variant="ghost"
            isDisabled={session.isFetching}
            onPress={() => {
              void session.retry();
            }}
          >
            Retry connection
          </Button>
        ) : (
          <span role="status" className="session-loading">
            Checking account…
          </span>
        )}
      </div>
    );
  return (
    <div className="account-navigation">
      {session.status === "authenticated" ? (
        <>
          {session.user?.global_role === "Driver" && (
            <Link className="nav-link" href={routes.driver}>
              Driver dashboard
            </Link>
          )}
          {session.user?.global_role === "Passenger" && (
            <Link
              href={routes.bookings}
              className="nav-link"
              aria-current={pathname === routes.bookings ? "page" : undefined}
            >
              My bookings
            </Link>
          )}
          <Link
            href={routes.profile}
            aria-current={pathname === routes.profile ? "page" : undefined}
            className="nav-link"
          >
            Profile
          </Link>
          <Button
            className="signup-link logout-button"
            variant="ghost"
            onPress={signOut}
            isDisabled={logoutState.isLoading}
          >
            {logoutState.isLoading ? "Logging out…" : "Logout"}
            <Icon name="arrow" width={16} height={16} />
          </Button>
        </>
      ) : (
        <>
          <Link
            href={routes.login}
            aria-current={pathname === routes.login ? "page" : undefined}
            className="nav-link"
          >
            Login
          </Link>
          <Link
            href={routes.signup}
            aria-current={pathname === routes.signup ? "page" : undefined}
            className="signup-link"
          >
            Sign up
            <Icon name="diagonal" width={16} height={16} />
          </Link>
        </>
      )}
    </div>
  );
}
