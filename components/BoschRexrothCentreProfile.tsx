import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cog,
  Gauge,
  Network,
} from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type Centre = SiteContent["centresList"][number];

const laboratories = [
  "Hydraulics",
  "Pneumatics",
  "Sensorics",
  "PLCs",
  "Drives & Control",
  "Mechatronics",
];

const programs = [
  {
    title: "Automation Technologies",
    level: "Basic / Intermediate",
    description: "Develop practical foundations in industrial automation technologies.",
    icon: Cog,
  },
  {
    title: "Industrial Hydraulics",
    level: "Basic / Advanced",
    description: "Study hydraulic systems and their role in industrial machinery and control.",
    icon: Gauge,
  },
  {
    title: "Industrial Pneumatics",
    level: "Basic / Advanced",
    description: "Explore pneumatic systems used in automation and manufacturing.",
    icon: Boxes,
  },
  {
    title: "Mechatronics",
    level: "Programme",
    description: "Bring mechanical, electrical and control technologies together.",
    icon: Cog,
  },
  {
    title: "Industrial Networking",
    level: "Programme",
    description: "Learn the role of industrial communication in connected automation systems.",
    icon: Network,
  },
  {
    title: "Sensorics",
    level: "Programme",
    description: "Understand sensing technologies used to monitor industrial processes.",
    icon: Gauge,
  },
  {
    title: "Motion Control",
    level: "Programme",
    description: "Explore motion control concepts used in automated equipment.",
    icon: Cog,
  },
];

export default function BoschRexrothCentreProfile({
  centre,
  course,
}: {
  centre: Centre;
  course?: Course;
}) {
  return (
    <div className="coe-page bosch-rexroth-page">
      <CoeTrainingHeader />
      <main>
        <section className="bosch-rexroth-hero">
          <Image
            src={centre.image}
            alt="Students learning in the Bosch Rexroth automation laboratory"
            fill
            priority
            sizes="100vw"
            unoptimized={shouldBypassImageOptimization(centre.image)}
          />
          <div className="bosch-rexroth-hero-shade" />
          <div className="bosch-rexroth-hero-content coe-page-container">
            <Link href="/coe-training" className="bosch-rexroth-back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All centres
            </Link>
            <p className="bosch-rexroth-hero-kicker">Automation · Hydraulics · Pneumatics · Mechatronics</p>
            <h1>BOSCH Rexroth Centre of Competence in Automation Technologies</h1>
            <p className="bosch-rexroth-hero-description">
              Industry-focused training and research in automation technologies for engineering
              and manufacturing.
            </p>
            <div className="bosch-rexroth-hero-actions">
              <a href="#bosch-rexroth-programmes">Explore programmes <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#bosch-rexroth-labs">Explore laboratories</a>
            </div>
          </div>
        </section>

        <section className="bosch-rexroth-about-section" aria-labelledby="bosch-rexroth-about-heading">
          <div className="coe-page-container">
            <div className="bosch-rexroth-section-heading">
              <span className="coe-eyebrow">AKGEC × BOSCH REXROTH AG, GERMANY</span>
              <h2 id="bosch-rexroth-about-heading">About the Centre</h2>
              <p>{centre.description}</p>
            </div>
            <div className="bosch-rexroth-about-grid">
              <div className="bosch-rexroth-about-image">
                <Image
                  src={centre.image}
                  alt="Students working with Bosch Rexroth laboratory equipment"
                  fill
                  sizes="(max-width: 760px) 100vw, 48vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
              </div>
              <div className="bosch-rexroth-overview">
                <span className="bosch-rexroth-date-chip">MOU: 7 May 2012 · Inaugurated: 9 March 2013</span>
                <h3>Bridging technology and industry</h3>
                <p>
                  AKGEC collaborated with Bosch Rexroth AG, Germany, to establish the Centre of
                  Excellence in Automation Technologies. The partnership was formed to bridge
                  technological gaps and respond to the needs of engineering and manufacturing
                  industries.
                </p>
                <p>
                  The centre brings together six specialist laboratories with practical training
                  in industrial automation technologies.
                </p>
                <div className="bosch-rexroth-focus-list">
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Training &amp; education</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Industry engagement</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Applied automation</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Research</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bosch-rexroth-labs-section" id="bosch-rexroth-labs" aria-labelledby="bosch-rexroth-labs-heading">
          <div className="coe-page-container">
            <div className="bosch-rexroth-section-heading">
              <span className="coe-eyebrow">HANDS-ON LEARNING</span>
              <h2 id="bosch-rexroth-labs-heading">Six Specialist Laboratories</h2>
              <p>
                The centre brief describes six laboratories adhering to international standards,
                equipped for practical learning across core automation disciplines.
              </p>
            </div>
            <div className="bosch-rexroth-lab-showcase">
              <div className="bosch-rexroth-lab-photo">
                <Image
                  src={centre.image}
                  alt="Bosch Rexroth automation lab with students and training equipment"
                  fill
                  sizes="(max-width: 760px) 100vw, 55vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
                <span>Automation Technologies Lab</span>
              </div>
              <div className="bosch-rexroth-lab-grid">
                {laboratories.map((name, index) => (
                  <article className="bosch-rexroth-lab-card" key={name}>
                    <span className="bosch-rexroth-lab-number">0{index + 1}</span>
                    <h3>{name}</h3>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bosch-rexroth-programmes-section" id="bosch-rexroth-programmes" aria-labelledby="bosch-rexroth-programmes-heading">
          <div className="coe-page-container">
            <div className="bosch-rexroth-section-heading">
              <span className="coe-eyebrow">BUILD PRACTICAL SKILLS</span>
              <h2 id="bosch-rexroth-programmes-heading">Training Programmes</h2>
              <p>
                Training covers the core technologies used in industrial automation, from
                hydraulics and pneumatics to networking and motion control.
              </p>
            </div>
            <div className="bosch-rexroth-programme-grid">
              {programs.map(({ title, level, description, icon: Icon }) => (
                <article className="bosch-rexroth-programme-card" key={title}>
                  <span className="bosch-rexroth-programme-icon"><Icon size={24} aria-hidden="true" /></span>
                  <span className="bosch-rexroth-programme-level">{level}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className="bosch-rexroth-impact-strip" aria-label="Training activity reported in the centre brief">
              <div><strong>60+</strong><span>training programmes</span></div>
              <div><strong>900+</strong><span>students trained</span></div>
              <div><strong>40+</strong><span>one-day workshops</span></div>
              <div><strong>1,000+</strong><span>workshop participants</span></div>
              <p>Reported activity for students and workshop participants.</p>
            </div>
            <div className="bosch-rexroth-registration-panel">
              <div>
                <span className="coe-eyebrow">JOIN A PROGRAMME</span>
                <h3>Plan your automation training</h3>
                {course ? (
                  <>
                    <p className="bosch-rexroth-course-name">{course.name} — current catalogue fees</p>
                    <div className="bosch-rexroth-course-fees">
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

        <section className="bosch-rexroth-certification-section" aria-labelledby="bosch-rexroth-certification-heading">
          <div className="coe-page-container bosch-rexroth-certification-grid">
            <div>
              <span className="coe-eyebrow">INDUSTRY COLLABORATION</span>
              <h2 id="bosch-rexroth-certification-heading">Joint Certification</h2>
              <p>
                Successful participants receive joint certification from AKGEC and Bosch Rexroth,
                recognizing learning completed through the centre.
              </p>
              <p className="bosch-rexroth-recognition">{centre.recognition}</p>
            </div>
            <div className="bosch-rexroth-certificate-mark">
              <Image
                src={centre.image}
                alt="Students training in the Bosch Rexroth automation laboratory"
                fill
                sizes="(max-width: 760px) 280px, 250px"
                unoptimized={shouldBypassImageOptimization(centre.image)}
              />
              <small>CENTRE OF COMPETENCE</small>
              <CheckCircle2 size={34} aria-hidden="true" />
              <strong>Joint certification</strong>
              <em>Automation Technologies</em>
            </div>
          </div>
        </section>

        <section className="bosch-rexroth-industry-section" aria-labelledby="bosch-rexroth-industry-heading">
          <div className="coe-page-container">
            <div className="bosch-rexroth-section-heading">
              <span className="coe-eyebrow">WORKING WITH INDUSTRY</span>
              <h2 id="bosch-rexroth-industry-heading">Corporate Training</h2>
              <p>
                The centre brief records corporate training programmes for manufacturing
                organizations including:
              </p>
            </div>
            <div className="bosch-rexroth-company-list">
              <span>Windmöller &amp; Hölscher</span>
              <span>CHW</span>
              <span>Shriram Pistons</span>
              <span>Anmol Bakers</span>
              <span>Sunil Health Care</span>
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
