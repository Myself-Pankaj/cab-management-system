import { HomeContent } from "@/features/booking/components/home-content";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@heroui/react";
import { ActionLink } from "@/components/ui/action-link";
import { Icon } from "@/components/ui/icon";
import { JourneyInvitation } from "@/components/shared/journey-invitation";
import { routes } from "@/lib/routes";

const steps = [
  {
    number: "01",
    title: "Begin with you",
    description:
      "A name, a few details, and the beginning of your Safar story.",
    icon: "user",
  },
  {
    number: "02",
    title: "Find your somewhere",
    description:
      "The everyday, the long-awaited, the just-because. Imagine where you’ll go next.",
    icon: "pin",
  },
  {
    number: "03",
    title: "Enjoy the in-between",
    description:
      "A favourite playlist. A window-side daydream. Make space for the journey itself.",
    icon: "sun",
  },
] as const;

export default function Home() {
  return (
    <HomeContent>
      <section className="hero page-width" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            NOT JUST A DESTINATION. A JOURNEY.
          </p>
          <h1 id="hero-heading">
            Every journey
            <br />
            deserves a<br />
            <em>beautiful</em>
            <br className="hero-heading-break" /> beginning.
          </h1>
          <p className="hero-description">
            For the everyday escapes and the miles that matter.
            <br className="desktop-break" /> A more thoughtful way to go, with
            Safar Cabs.
          </p>
          <div className="hero-actions">
            <ActionLink href={routes.signup}>Begin your journey</ActionLink>
            <Link href={routes.about} className="text-link">
              Get to know us
              <Icon name="diagonal" width={16} height={16} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="tiny-star" aria-hidden="true">
              ✳
            </span>
            <span>Life happens between the places.</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <Image
              src="/images/safar-car.jpg"
              alt="A silver Mercedes on a quiet road, an invitation to enjoy the journey"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 52vw"
            />
            <div className="image-shade" />
            <span className="photo-label">THE ART OF GOING PLACES</span>
            <div className="hero-photo-caption">
              <span>Take the scenic route.</span>
              <Icon name="diagonal" width={28} height={28} />
            </div>
          </div>
          <div className="journey-stamp" aria-hidden="true">
            <Icon name="sun" width={30} height={30} />
            <span>
              MORE THAN
              <br />
              THE MILES
            </span>
          </div>
          <div className="image-caption">
            <span>01 / THE OPEN ROAD</span>
            <span>A fresh perspective, every mile.</span>
          </div>
        </div>
      </section>
      <section className="values-strip" aria-label="Our philosophy">
        <div className="page-width values-inner">
          <span className="values-intro">
            A journey, thoughtfully imagined.
          </span>
          <span>
            <Icon name="leaf" />A little more thoughtful
          </span>
          <span>
            <Icon name="sun" />A little more comfortable
          </span>
          <span>
            <Icon name="pin" />A little more you
          </span>
        </div>
      </section>
      <section
        className="introduction page-width"
        aria-labelledby="intro-heading"
      >
        <div className="intro-visual">
          <div className="landscape-image">
            <Image
              src="/images/safar-landscape.jpg"
              alt="Sunlight falling across a peaceful mountain landscape"
              fill
              sizes="(max-width: 760px) 90vw, 40vw"
            />
          </div>
          <span className="photo-corner" aria-hidden="true">
            THE WORLD
            <br />
            IS WAITING.
            <Icon name="diagonal" />
          </span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow">SAFAR MEANS JOURNEY</p>
          <h2 id="intro-heading">
            Getting there is
            <br />
            only <em>half the story.</em>
          </h2>
          <p>
            There’s something about being on the road. The changing view. The
            conversations. The quiet moments that become your favourite
            memories.
          </p>
          <p>
            Safar Cabs begins with a simple idea: the time between where you are
            and where you want to be deserves a little more care.
          </p>
          <Link href={routes.about} className="text-link underlined">
            A little about us
            <Icon name="arrow" width={18} height={18} />
          </Link>
        </div>
      </section>
      <section
        className="journey-section page-width"
        aria-labelledby="steps-heading"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">A SIMPLE START</p>
            <h2 id="steps-heading">
              Good journeys start
              <br />
              with <em>a little possibility.</em>
            </h2>
          </div>
          <p>
            From the first hello to the road ahead,
            <br className="desktop-break" /> let’s make the journey feel like
            yours.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <Card key={step.number} className="step-card">
              <CardContent>
                <div className="step-top">
                  <span>{step.number}</span>
                  <Icon name={step.icon} width={30} height={30} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="journey-note">
          Choose your journey, explore cab categories, and review your fare before booking.
        </p>
      </section>
      <JourneyInvitation />
    </HomeContent>
  );
}
