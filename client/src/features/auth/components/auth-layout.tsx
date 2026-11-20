import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import { AuthForm } from "./auth-form";

export function AuthLayout({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  return (
    <section className={`auth-layout page-width auth-layout--${mode}`}>
      <div className="auth-image">
        <Image
          src="/images/safar-landscape.jpg"
          alt="Sunlight tracing the peaks of a quiet mountain landscape"
          fill
          priority
          sizes="(max-width: 900px) 0px, 42vw"
        />
        <div className="auth-image-overlay" />
        <div className="auth-image-top">
          <span className="auth-monogram" aria-hidden="true">
            s.
          </span>
          <span>A LITTLE MORE JOURNEY.</span>
          <Icon name="diagonal" width={20} height={20} />
        </div>
        <div className="auth-image-copy">
          <span className="auth-image-kicker">
            <span />
            THE ROAD IS ONLY THE BEGINNING
          </span>
          <h2>
            {signup ? (
              <>
                New places.
                <br />
                New stories.
                <br />
                <em>Your next chapter.</em>
              </>
            ) : (
              <>
                A familiar feeling.
                <br />A fresh start.
                <br />
                <em>Welcome to Safar.</em>
              </>
            )}
          </h2>
          <p>
            For the places you love.
            <br />
            And the ones you haven’t found yet.
          </p>
          <div className="auth-journey-line" aria-hidden="true">
            <span className="journey-point" />
            <span className="journey-dashes" />
            <Icon name="sun" width={24} height={24} />
          </div>
          <div className="auth-image-bottom">
            <span>BEGIN HERE</span>
            <span>GO SOMEWHERE GOOD</span>
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-top">
          <Link href={routes.home} className="auth-back-link">
            <Icon name="arrow" width={15} height={15} />
            Back to Safar
          </Link>
          <span className="auth-small-mark" aria-hidden="true">
            ✳
          </span>
        </div>
        <nav className="auth-page-tabs" aria-label="Account pages">
          <Link href={routes.login} aria-current={!signup ? "page" : undefined}>
            Log in
          </Link>
          <Link href={routes.signup} aria-current={signup ? "page" : undefined}>
            Sign up
          </Link>
        </nav>
        <div className="auth-heading">
          <p className="eyebrow">
            {signup ? "A BEAUTIFUL BEGINNING" : "YOUR NEXT JOURNEY AWAITS"}
          </p>
          <h1>
            {signup ? (
              <>
                Let’s get you <em>going.</em>
              </>
            ) : (
              <>
                Welcome <em>back.</em>
              </>
            )}
          </h1>
          <p className="auth-description">
            {signup
              ? "Make a little room for the road ahead. Start here."
              : "Good to see you. Settle in and pick up where you left off."}
          </p>
        </div>
        <AuthForm mode={mode} />
      </div>
    </section>
  );
}
