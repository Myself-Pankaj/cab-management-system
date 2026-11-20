import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { routes } from "@/lib/routes";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <div>
          <Brand />
          <p>
            A little less rush.
            <br />A little more journey.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href={routes.home}>Home</Link>
          <Link href={routes.about}>About us</Link>
          <Link href={routes.login}>Login</Link>
          <Link href={routes.signup}>Sign up</Link>
        </nav>
        <p className="footer-note">
          Made for the roads ahead.
          <br />
          <span>Safar Cabs · India</span>
        </p>
      </div>
      <div className="page-width footer-bottom">
        <span>© 2026 Safar Cabs.</span>
        <span>Good journeys begin here.</span>
      </div>
    </footer>
  );
}
