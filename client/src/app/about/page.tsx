import type { Metadata } from "next";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { JourneyInvitation } from "@/components/shared/journey-invitation";

export const metadata: Metadata = { title: "About us" };

const values = [
  {
    icon: "leaf",
    title: "Care in the little things",
    text: "Thoughtfulness is our starting point, from the words we use to the experiences we’re building.",
  },
  {
    icon: "sun",
    title: "Space to feel at ease",
    text: "We believe a journey should leave you with a little more room to breathe.",
  },
  {
    icon: "pin",
    title: "People before places",
    text: "Every destination has a reason behind it. Every journey has a person at its heart.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="about-hero page-width">
        <p className="eyebrow">A LITTLE ABOUT SAFAR</p>
        <h1>
          It’s not just where you go.
          <br />
          It’s <em>how you get there.</em>
        </h1>
        <p>
          Safar means journey. For us, that’s more than a name.
          <br className="desktop-break" /> It’s a reminder to find meaning in
          the miles between.
        </p>
        <div className="about-panorama">
          <Image
            src="/images/safar-landscape.jpg"
            alt="An expansive mountain landscape under a soft blue sky"
            fill
            priority
            sizes="100vw"
          />
          <span>A change of scenery. A different perspective.</span>
        </div>
      </section>
      <section className="about-story page-width">
        <p className="eyebrow">OUR POINT OF VIEW</p>
        <div>
          <h2>
            A little less rush.
            <br />
            <em>A little more journey.</em>
          </h2>
          <p>
            The road connects more than places. It connects you to the people
            you miss, the opportunities you’re chasing, and the moments you’ll
            remember.
          </p>
          <p>
            We’re shaping Safar Cabs around that idea. A considered travel
            experience that makes room for the human side of getting from one
            place to another.
          </p>
        </div>
      </section>
      <section className="about-values page-width" aria-label="What guides us">
        {values.map((item) => (
          <article key={item.title}>
            <Icon name={item.icon} width={32} height={32} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
      <JourneyInvitation />
    </>
  );
}
