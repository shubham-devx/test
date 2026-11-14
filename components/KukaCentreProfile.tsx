import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircuitBoard,
  Flame,
  Factory,
  Printer,
  ShieldCheck,
} from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type Centre = SiteContent["centresList"][number];

const programs = [
  {
    type: "Training",
    title: "Robot Cell Designer",
    skills: "Basic | Advance",
    duration: "One week",
    audience: "For engineers",
    icon: CircuitBoard,
  },
  {
    type: "On-site training",
    title: "Industrial Robot Programming",
    skills: "Basic | Advance | Expert",
    duration: "Two weeks",
    audience: "For engineers",
    icon: Bot,
  },
  {
    type: "Industrial internship",
    title: "Industrial Robotics",
    skills: "Operation | Programming | Applications",
    duration: "Six months",
    audience: "For students",
    icon: Factory,
  },
  {
    type: "Training",
    title: "Robotic Application Programming",
    skills: "Arc welding | Spot welding | Milling",
    duration: "One week",
    audience: "For industry",
    icon: Flame,
  },
];

const services = [
  {
    title: "Robotic Machining — Milling & Deburring",
    description:
      "Use robotic milling to cut metals, aluminium, wood, plastics, EPS, high-density foam, wax, polystyrene and carbon-fibre materials.",
    icon: Bot,
  },
  {
    title: "Robotic 3D Printing",
    description:
      "Explore robotic additive manufacturing for accurately creating large objects and integrating repeatable production workflows.",
    icon: Printer,
  },
  {
    title: "Robotic Welding & Cutting",
    description:
      "Develop reliable, high-quality robotic welding applications for a wide range of industrial requirements.",
    icon: Flame,
  },
];

const projects = [
  {
    title: "Robotic 3D Printing",
    description:
      "An approach to additively create large objects accurately and repeatedly, moving production towards more automated and integrated processes.",
    icon: Printer,
  },
  {
    title: "Robotic Vision Application",
    description:
      "Vision-guided robots combine industrial robots with integrated vision systems to provide a cost-effective alternative to traditional manufacturing.",
    icon: Bot,
  },
  {
    title: "Robot Safety Light Curtain",
    description:
      "Integrating a safety light-curtain sensor with a KUKA robot helps protect the robot work envelope and can reduce workplace accidents.",
    icon: ShieldCheck,
  },
];

export default function KukaCentreProfile({
  centre,
  course,
}: {
  centre: Centre;
  course?: Course;
}) {
  return (
    <div className="coe-page kuka-centre-page">
      <CoeTrainingHeader />
      <main>
        <section className="kuka-hero">
          <Image
            src={centre.image}
            alt="Students learning on an industrial robot at the KUKA training centre"
            fill
            priority
            sizes="100vw"
            unoptimized={shouldBypassImageOptimization(centre.image)}
          />
          <div className="kuka-hero-shade" />
          <div className="kuka-hero-content coe-page-container">
            <Link href="/coe-training" className="kuka-back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All centres
            </Link>
            <p className="kuka-hero-kicker">India&apos;s first industrial robot training centre</p>
            <h1>Industrial Robotics Training at AKGEC, Ghaziabad</h1>
            <p className="kuka-hero-description">
              Hands-on robotics training, applied research and industrial automation solutions
              developed with KUKA Robotics.
            </p>
            <div className="kuka-hero-actions">
              <a href="#kuka-programmes">Explore training <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#kuka-services">Robotics services</a>
            </div>
          </div>
        </section>

        <section className="kuka-about-section" aria-labelledby="kuka-about-heading">
          <div className="coe-page-container">
            <div className="kuka-section-heading">
              <span className="coe-eyebrow">AKGEC × KUKA ROBOTICS</span>
              <h2 id="kuka-about-heading">About the Centre</h2>
              <p>
                AKGEC, jointly with KUKA Robotics (India), established India&apos;s first
                Industrial Robotics Training Centre for educational institutions at AKGEC,
                Ghaziabad. The centre was inaugurated on 5 May 2011 and has been operational
                since then.
              </p>
            </div>
            <div className="kuka-about-grid">
              <div className="kuka-about-image">
                <Image
                  src={centre.image}
                  alt="A KUKA industrial robot used for hands-on training"
                  fill
                  sizes="(max-width: 760px) 100vw, 48vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
              </div>
              <div className="kuka-objectives">
                <h3>Learning built around real industrial robotics</h3>
                <ul>
                  <li><CheckCircle2 size={19} aria-hidden="true" />Train engineering graduates and diploma students of all disciplines to meet industry expectations.</li>
                  <li><CheckCircle2 size={19} aria-hidden="true" />Foster research in applied robotics and industrial applications.</li>
                  <li><CheckCircle2 size={19} aria-hidden="true" />Introduce young professionals to the cross-disciplinary field of robotics and its latest developments.</li>
                </ul>
                <p className="kuka-about-note">{centre.details?.[2]}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="kuka-programmes-section" id="kuka-programmes" aria-labelledby="kuka-programmes-heading">
          <div className="coe-page-container">
            <div className="kuka-section-heading">
              <span className="coe-eyebrow">LEARN BY DOING</span>
              <h2 id="kuka-programmes-heading">Training Programmes</h2>
              <p>
                Programmes serve engineering students across disciplines and industry
                professionals, with practical exposure to industrial robot systems.
              </p>
            </div>
            <div className="kuka-programme-grid">
              {programs.map(({ type, title, skills, duration, audience, icon: Icon }) => (
                <article className="kuka-programme-card" key={title}>
                  <span className="kuka-programme-icon"><Icon size={25} aria-hidden="true" /></span>
                  <span className="kuka-programme-type">{type}</span>
                  <h3>{title}</h3>
                  <p>{skills}</p>
                  <div className="kuka-programme-meta">
                    <span>{duration}</span>
                    <span>{audience}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="kuka-applications-strip">
              <strong>Hands-on robotics applications</strong>
              <ul>
                {centre.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="kuka-registration-panel">
              <div>
                <span className="coe-eyebrow">JOIN A PROGRAMME</span>
                <h3>Plan your KUKA robotics training</h3>
                {course ? (
                  <>
                    <p className="kuka-course-name">{course.name} — current catalogue fees</p>
                    <div className="kuka-course-fees">
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

        <section className="kuka-services-section" id="kuka-services" aria-labelledby="kuka-services-heading">
          <div className="coe-page-container">
            <div className="kuka-section-heading">
              <span className="coe-eyebrow">INDUSTRIAL APPLICATIONS</span>
              <h2 id="kuka-services-heading">Robotics Services</h2>
              <p>
                The centre offers consultation and services to develop and implement individual
                and integrated robotics solutions for industrial applications.
              </p>
            </div>
            <div className="kuka-service-grid">
              {services.map(({ title, description, icon: Icon }, index) => (
                <article className={`kuka-service-card${index === 1 ? " is-light" : ""}`} key={title}>
                  <Icon size={34} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="kuka-certification-section" aria-labelledby="kuka-certification-heading">
          <div className="coe-page-container kuka-certification-inner">
            <div>
              <span className="coe-eyebrow">INDUSTRY-ALIGNED RECOGNITION</span>
              <h2 id="kuka-certification-heading">Joint KUKA &amp; AKGEC Certification</h2>
              <p>
                Participants who successfully complete the training receive joint certification
                from KUKA Robotics and AKGEC. Training content and course materials follow KUKA
                standards and are kept in line with those used by KUKA College internationally.
              </p>
            </div>
            <div className="kuka-certificate-mark" aria-label="KUKA Robotics and AKGEC Skills Foundation joint certification">
              <Image
                src={centre.image}
                alt="Students learning on an industrial robot"
                fill
                sizes="(max-width: 760px) 280px, 250px"
                unoptimized={shouldBypassImageOptimization(centre.image)}
              />
              <small>INDUSTRIAL ROBOTICS TRAINING</small>
              <CheckCircle2 size={30} aria-hidden="true" />
              <strong>Joint certification</strong>
            </div>
          </div>
        </section>

        <section className="kuka-projects-section" aria-labelledby="kuka-projects-heading">
          <div className="coe-page-container">
            <div className="kuka-section-heading">
              <span className="coe-eyebrow">APPLIED ROBOTICS</span>
              <h2 id="kuka-projects-heading">Projects &amp; Innovation</h2>
              <p>
                Students and trainees develop robotics projects for industrial and general
                applications, helping people and businesses complete tasks effectively and safely.
              </p>
            </div>
            <div className="kuka-project-grid">
              {projects.map(({ title, description, icon: Icon }) => (
                <article className="kuka-project-card" key={title}>
                  <span className="kuka-project-icon"><Icon size={27} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
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
