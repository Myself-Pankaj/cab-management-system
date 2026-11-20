"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@heroui/react";
import { useSession } from "../hooks/use-session";
import { apiErrorMessage } from "../api-error";
import { LoadingSkeleton } from "@/components/shared/query-state";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";

export function Profile() {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.status === "anonymous") router.replace(routes.login);
  }, [session.status, router]);
  if (session.status === "anonymous" || session.isChecking)
    return (
      <div className="profile-page page-width"><LoadingSkeleton label="Opening your account…" count={1} /></div>
    );
  if (session.error)
    return (
      <section className="profile-page page-width">
        <h1>Your profile</h1>
        <p className="form-status form-error" role="alert">
          {apiErrorMessage(session.error)}
        </p>
        <Button
          onPress={() => {
            void session.retry();
          }}
          isDisabled={session.isFetching}
        >
          Try again
        </Button>
      </section>
    );
  const user = session.user;
  if (!user)
    return (
      <div className="profile-loading page-width" role="status">
        Loading your profile…
      </div>
    );
  const initials =
    [user.first_name, user.last_name]
      .filter(Boolean)
      .map((name) => name?.[0])
      .join("")
      .toUpperCase() ||
    user.full_name[0]?.toUpperCase() ||
    "S";
  return (
    <section className="profile-page page-width">
      <div className="profile-heading">
        <p className="eyebrow">YOUR LITTLE CORNER OF SAFAR</p>
        <h1>
          A place for
          <br />
          <em>your journeys.</em>
        </h1>
        <p>Good to see you, {user.first_name || user.full_name}.</p>
        {user.global_role === "Passenger" && (
          <Link
            href={routes.bookings}
            className="action-link profile-bookings-link"
          >
            My bookings
            <Icon name="arrow" width={18} height={18} />
          </Link>
        )}
      </div>
      <nav className="ui-account-shortcuts" aria-label="Account shortcuts">
        {user.global_role === "Passenger" && <><Link href={routes.home}><Icon name="car" />Plan a journey</Link><Link href={routes.bookings}><Icon name="clock" />My bookings</Link></>}
        {user.global_role === "Driver" && <><Link href={routes.driver}><Icon name="car" />Driver workspace</Link><Link href="/driver/onboarding"><Icon name="user" />Vehicle & documents</Link></>}
        {user.global_role === "Admin" && <Link href={routes.admin}><Icon name="car" />Operations overview</Link>}
      </nav>
      <Card className="profile-card">
        <CardContent>
          <div className="profile-identity">
            <div className="profile-avatar" aria-hidden="true">
              {initials}
            </div>
            <div>
              <h2>{user.full_name}</h2>
              <span className="role-badge">
                {user.global_role === "Driver"
                  ? "Driver"
                  : (user.global_role ?? "Account")}
              </span>
            </div>
          </div>
          <dl className="profile-details">
            <div>
              <dt>First name</dt>
              <dd>{user.first_name || "—"}</dd>
            </div>
            <div>
              <dt>Last name</dt>
              <dd>{user.last_name || "—"}</dd>
            </div>
            <div>
              <dt>Email address</dt>
              <dd>{user.email || "—"}</dd>
            </div>
            <div>
              <dt>Phone number</dt>
              <dd>{user.phone_number || "—"}</dd>
            </div>
          </dl>
          <div className="profile-note">
            <Icon name="leaf" width={20} height={20} />
            <p>Your Safar account, all in one place.</p>
          </div>
        </CardContent>
      </Card>
      <Link href={routes.home} className="text-link">
        Back to the beginning
        <Icon name="arrow" width={17} height={17} />
      </Link>
    </section>
  );
}
