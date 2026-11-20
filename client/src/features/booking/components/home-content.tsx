"use client";
import type { ReactNode } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { JourneyForm } from "./journey-form";
export function HomeContent({ children }: { children: ReactNode }) {
  const session = useSession();
  if (
    session.isChecking ||
    (session.status === "unknown" && !session.error) ||
    (session.status === "authenticated" && !session.user && !session.error)
  )
    return (
      <p className="booking-empty" role="status">
        Getting Safar ready…
      </p>
    );
  if (session.user?.global_role === "Passenger") return <JourneyForm />;
  return children;
}
