import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Boxes, CheckCircle2, Cog, Gauge } from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import { getCentreSlug } from "@/lib/centres";
import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type Centre = SiteContent["centresList"][number];

type CentreProfileConfig = {
  theme: "automation" | "digital" | "engineering";
  highlights: string[];
};

const profileConfig: Record<string, CentreProfileConfig> = {
  "siemens-advance-manufacturing-centre": {
    theme: "engineering",
    highlights: ["Established 14 December 2016", "25 training programmes", "349 students trained"],
  },
  "aia-centre-for-integrated-automation": {
    theme: "automation",
    highlights: ["Established 27 June 2014", "B&R, Siemens & Festo systems", "Theory and hands-on training"],
  },
  "mitsubishi-authorised-training-centre": {
    theme: "automation",
    highlights: ["Inaugurated 8 June 2014", "Factory automation & drives", "Training and applied research"],
  },
  "fab-lab-centre-of-digital-manufacturing": {
    theme: "digital",
    highlights: ["Established December 2016", "Grassroots Invention Group & MIT's Center for Bits and Atoms", "Digital fabrication and prototyping"],
  },
  "bosch-joint-certification-centre": {
    theme: "engineering",
    highlights: ["Established March 2023", "Automotive training with Bosch Ltd.", "Workshop models and diagnostic systems"],
  },
  "zeiss-calibration-and-testing-centre": {
    theme: "engineering",
    highlights: ["NABL-accredited facility", "IS/ISO/IEC 17025:2017 compliant", "Established 9 February 2016"],
  },
  "janatics-industrial-pneumatic-knowledge-centre": {
    theme: "automation",
    highlights: ["India's first Industrial Pneumatic Knowledge Centre", "NSIC Training-cum-Incubation Centre", "Industrial pneumatics and low-cost automation"],
  },
  "siemens-centre-of-excellence-in-automation": {
    theme: "automation",
    highlights: ["Established 14 December 2016", "Joint AKGEC & Siemens certification", "Siemens automation equipment and software"],
  },
  "dgca-certified-remote-pilot-training-drone-academy": {
    theme: "digital",
    highlights: ["DGCA-Certified RPTO No. 35/2024", "Drone simulation lab and flying station", "Four DGCA type-certified drones"],
  },
  "common-facility-center-cfc": {
    theme: "engineering",
    highlights: ["Uttar Pradesh ODOP initiative", "Consortium of 22 industries and academia", "General engineering and product development"],
  },
};

const programmeIcons = [Cog, Gauge, Boxes];

export default function DetailedCentreProfile({
  centre,
  course,
}: {
  centre: Centre;
  course?: Course;
}) {
  const config = profileConfig[getCentreSlug(centre.name)] ?? {
    theme: "engineering" as const,
    highlights: [centre.partner, centre.focus],
  };
  const image = centre.image;

  return (
    <div className={`coe-page detailed-centre-page detailed-centre-theme--${config.theme}`}>
      <CoeTrainingHeader />
      <main>
        <section className="detailed-centre-hero">
          <Image src={image} alt={`${centre.name} at AKGEC`} fill priority sizes="100vw" unoptimized={shouldBypassImageOptimization(image)} />
          <div className="detailed-centre-hero-shade" />
          <div className="detailed-centre-hero-content coe-page-container">
            <Link href="/coe-training" className="detailed-centre-back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All centres
            </Link>
            <p className="detailed-centre-kicker">Centre of Excellence · AKGEC Skills Foundation</p>
            <h1>{centre.name}</h1>
            <p className="detailed-centre-hero-description">{centre.description}</p>
            <div className="detailed-centre-hero-actions">
              <a href="#centre-programmes">Explore programmes <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#centre-overview">Centre overview</a>
            </div>
          </div>
        </section>

        <section className="detailed-centre-overview-section" id="centre-overview" aria-labelledby="centre-overview-heading">
          <div className="coe-page-container">
            <div className="detailed-centre-section-heading">
              <span className="coe-eyebrow">ABOUT THE CENTRE</span>
              <h2 id="centre-overview-heading">Industry partnership, practical learning</h2>
              <p>{centre.description}</p>
            </div>
            <div className="detailed-centre-overview-grid">
              <div className="detailed-centre-image">
                <Image src={image} alt={`${centre.focus} at AKGEC`} fill sizes="(max-width: 760px) 100vw, 48vw" unoptimized={shouldBypassImageOptimization(image)} />
              </div>
              <div className="detailed-centre-facts">
                <span className="detailed-centre-partner-chip">{centre.partner}</span>
                <h3>{centre.focus}</h3>
                <div className="detailed-centre-highlight-list">
                  {config.highlights.map((highlight) => (
                    <span key={highlight}><CheckCircle2 size={16} aria-hidden="true" />{highlight}</span>
                  ))}
                </div>
              </div>
            </div>
            {centre.details?.length ? (
              <div className="detailed-centre-story-grid">
                {centre.details.map((detail, index) => (
                  <article className="detailed-centre-story-card" key={detail}>
                    <span>0{index + 1}</span>
                    <p>{detail}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {centre.items.length > 0 ? (
          <section className="detailed-centre-programmes-section" id="centre-programmes" aria-labelledby="centre-programmes-heading">
            <div className="coe-page-container">
              <div className="detailed-centre-section-heading">
                <span className="coe-eyebrow">LEARN &amp; APPLY</span>
                <h2 id="centre-programmes-heading">{centre.itemsTitle}</h2>
                <p>
                  Explore the centre&apos;s training and facilities, designed around its industry
                  focus and practical engineering experience.
                </p>
              </div>
              <div className="detailed-centre-programme-grid">
                {centre.items.map((item, index) => {
                  const Icon = programmeIcons[index % programmeIcons.length];
                  return (
                    <article className="detailed-centre-programme-card" key={item}>
                      <span className="detailed-centre-programme-icon"><Icon size={23} aria-hidden="true" /></span>
                      <span className="detailed-centre-programme-index">PROGRAMME {String(index + 1).padStart(2, "0")}</span>
                      <h3>{item}</h3>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="detailed-centre-recognition-section" aria-labelledby="centre-recognition-heading">
          <div className="coe-page-container detailed-centre-recognition-inner">
            <div>
              <span className="coe-eyebrow">PARTNER &amp; RECOGNITION</span>
              <h2 id="centre-recognition-heading">Learning shaped with industry</h2>
              <p>{centre.recognition}</p>
            </div>
            <div className="detailed-centre-recognition-mark">
              <div className="detailed-centre-recognition-photo">
                <Image
                  src={image}
                  alt={`${centre.name} training facilities`}
                  fill
                  sizes="(max-width: 760px) 280px, 250px"
                  unoptimized={shouldBypassImageOptimization(image)}
                />
              </div>
              <small>{centre.itemsTitle}</small>
            </div>
          </div>
        </section>

        <section className="detailed-centre-registration-section" aria-labelledby="centre-registration-heading">
          <div className="coe-page-container">
            <div className="detailed-centre-registration-panel">
              <div>
                <span className="coe-eyebrow">PLAN YOUR TRAINING</span>
                <h2 id="centre-registration-heading">Start with the right programme</h2>
                {course ? (
                  <>
                    <p className="detailed-centre-course-name">{course.name} — current catalogue fees</p>
                    <div className="detailed-centre-course-fees">
                      {course.durations.map((duration) => (
                        <span key={duration.label}>
                          {duration.label}<strong>₹{duration.fee.toLocaleString("en-IN")}</strong>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>Ask the ASF team about upcoming batches, duration and fees.</p>
                )}
              </div>
              <CentreRegistrationAction centreName={centre.name} courseName={course?.name} />
            </div>
          </div>
        </section>
      </main>
      <footer className="coe-page-footer">
        <div className="coe-page-container">
          <Link href="/coe-training"><ArrowLeft size={16} aria-hidden="true" /> Return to all centres</Link>
        </div>
      </footer>
    </div>
  );
}
