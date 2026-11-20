import { ActionLink } from "@/components/ui/action-link";
import { routes } from "@/lib/routes";

export function JourneyInvitation() {
  return (
    <section
      className="invitation page-width"
      aria-labelledby="invitation-heading"
    >
      <div className="invitation-art" aria-hidden="true">
        <svg viewBox="0 0 400 240" fill="none">
          <path
            d="M-30 210c100-180 180 90 260-70S330 5 430 40"
            stroke="currentColor"
          />
          <path
            d="M-30 224c100-180 180 90 260-70S330 19 430 54"
            stroke="currentColor"
            strokeDasharray="4 8"
          />
          <circle cx="232" cy="133" r="8" fill="currentColor" />
        </svg>
      </div>
      <div>
        <p className="eyebrow">THE NEXT CHAPTER IS YOURS</p>
        <h2 id="invitation-heading">
          Your next journey.
          <br />
          <em>A beautiful beginning.</em>
        </h2>
        <p>
          A familiar destination or somewhere completely new.
          <br className="desktop-break" /> Start your Safar story with us.
        </p>
      </div>
      <ActionLink href={routes.signup} light>
        Create your account
      </ActionLink>
    </section>
  );
}
