import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  Boxes,
  CheckCircle2,
  Cog,
  DraftingCompass,
  Factory,
  Gauge,
  Printer,
  ScanLine,
} from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type Centre = SiteContent["centresList"][number];

const programs = [
  { type: "Training", title: "Design for Additive Manufacturing", skills: "CAD | 3D Printing", duration: "One week", audience: "For engineers", icon: Printer },
  { type: "Industrial training program", title: "Digital Manufacturing", skills: "NX-CAD/CAM | 3D Printing | Proto-development", duration: "Six weeks", audience: "For engineers", icon: Factory },
  { type: "Workshop", title: "Automotive Design", skills: "Basic CAD | Validation", duration: "One day", audience: "For beginners", icon: Cog },
  { type: "Training", title: "NX-CAD", skills: "Modelling | Assembly | Drafting", duration: "One week", audience: "For engineers", icon: DraftingCompass },
  { type: "Training", title: "Solid Edge ST-09", skills: "Modelling | Surfacing | Simulation", duration: "One week", audience: "For engineers", icon: Boxes },
  { type: "Workshop", title: "Digital Fabrication Techniques", skills: "RD Works | Aspire", duration: "One day", audience: "For beginners", icon: ScanLine },
  { type: "Training", title: "NX CAM Robot Programming", skills: "CAM | Post-processing | Robot simulation", duration: "One week", audience: "For engineers", icon: Bot },
];

const services = [
  {
    title: "3D Modelling",
    description:
      "Experience a complete 3D model beyond a 2D drawing. Design and draft detailed machine parts and components to support product development.",
    icon: Boxes,
  },
  {
    title: "Structural Analysis & Optimization",
    description:
      "Use engineering analysis to optimize product designs, reduce costly prototyping and help bring products to market faster with Siemens FEMAP.",
    icon: Gauge,
  },
  {
    title: "CNC Machining",
    description:
      "Precision manufacturing support with 4-axis CNC milling, CNC turning, CNC drill-tapping and cylindrical grinding machines.",
    icon: Factory,
  },
];

const projects = [
  {
    title: "Thermoelectric Air-Conditioning Model",
    description:
      "Design, fabricate and performance-test a Peltier-based model for indoor cooling. Thermoelectric cooling is explored as a promising alternative.",
    icon: Cog,
  },
  {
    title: "Robotic 3D Printer",
    description:
      "Combine robotics and 3D printing to explore a more flexible approach to additive manufacturing.",
    icon: Printer,
  },
  {
    title: "Ornithopter",
    description:
      "Design and fabricate a flapping-wing aircraft inspired by the flight of birds, bats and insects.",
    icon: Bot,
  },
];

export default function SiemensPlmCentreProfile({
  centre,
  course,
}: {
  centre: Centre;
  course?: Course;
}) {
  return (
    <div className="coe-page siemens-plm-page">
      <CoeTrainingHeader />
      <main>
        <section className="siemens-plm-hero">
          <Image
            src={centre.image}
            alt="Engineering students in a computer-aided design laboratory"
            fill
            priority
            sizes="100vw"
            unoptimized={shouldBypassImageOptimization(centre.image)}
          />
          <div className="siemens-plm-hero-shade" />
          <div className="siemens-plm-hero-content coe-page-container">
            <Link href="/coe-training" className="siemens-plm-back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All centres
            </Link>
            <p className="siemens-plm-hero-kicker">Digital product engineering · Manufacturing · Simulation</p>
            <h1>SIEMENS PLM Centre of Excellence</h1>
            <p className="siemens-plm-hero-description">
              Develop engineering professionals with next-generation product lifecycle and digital
              manufacturing technologies.
            </p>
            <div className="siemens-plm-hero-actions">
              <a href="#siemens-plm-programmes">Explore training <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#siemens-plm-services">Explore services</a>
            </div>
          </div>
        </section>

        <section className="siemens-plm-about-section" aria-labelledby="siemens-plm-about-heading">
          <div className="coe-page-container">
            <div className="siemens-plm-section-heading">
              <span className="coe-eyebrow">AKGEC × SIEMENS PLM</span>
              <h2 id="siemens-plm-about-heading">About the Centre</h2>
              <p>
                To develop engineering professionals equipped with next-generation technologies,
                AKGEC jointly with Siemens PLM established North India&apos;s first Product
                Lifecycle Management Centre. It was inaugurated on 12 December 2012 and has been
                operational since then.
              </p>
            </div>
            <div className="siemens-plm-about-grid">
              <div className="siemens-plm-about-image">
                <Image
                  src={centre.image}
                  alt="Students working in a computer-aided design classroom"
                  fill
                  sizes="(max-width: 760px) 100vw, 48vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
              </div>
              <div className="siemens-plm-overview">
                <h3>Product knowledge across its entire lifecycle</h3>
                <p>
                  Product Lifecycle Management is an integrated, information-driven approach to
                  every aspect of a product&apos;s life—from design inception through manufacture,
                  deployment and maintenance to final disposal.
                </p>
                <p>
                  The centre serves automotive, industrial machinery, automation, aerospace and
                  shipbuilding, with training in digital product engineering, lifecycle management
                  and digital manufacturing.
                </p>
                <div className="siemens-plm-software">
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Solid Edge</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> NX CAD/CAM/CAE</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Teamcenter</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Tecnomatix</span>
                </div>
                <p className="siemens-plm-centre-note">{centre.details?.[2]}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="siemens-plm-programmes-section" id="siemens-plm-programmes" aria-labelledby="siemens-plm-programmes-heading">
          <div className="coe-page-container">
            <div className="siemens-plm-section-heading">
              <span className="coe-eyebrow">LEARN BY DESIGNING</span>
              <h2 id="siemens-plm-programmes-heading">Training Programmes</h2>
              <p>
                Programmes build practical skills in design, analysis, simulation, digital
                manufacturing and fabrication for engineering students and industry professionals.
              </p>
            </div>
            <div className="siemens-plm-programme-grid">
              {programs.map(({ type, title, skills, duration, audience, icon: Icon }) => (
                <article className="siemens-plm-programme-card" key={title}>
                  <span className="siemens-plm-programme-icon"><Icon size={24} aria-hidden="true" /></span>
                  <span className="siemens-plm-programme-type">{type}</span>
                  <h3>{title}</h3>
                  <p>{skills}</p>
                  <div className="siemens-plm-programme-meta">
                    <span>{duration}</span>
                    <span>{audience}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="siemens-plm-registration-panel">
              <div>
                <span className="coe-eyebrow">JOIN A PROGRAMME</span>
                <h3>Plan your Siemens PLM training</h3>
                {course ? (
                  <>
                    <p className="siemens-plm-course-name">{course.name} — current catalogue fees</p>
                    <div className="siemens-plm-course-fees">
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

        <section className="siemens-plm-services-section" id="siemens-plm-services" aria-labelledby="siemens-plm-services-heading">
          <div className="coe-page-container">
            <div className="siemens-plm-section-heading">
              <span className="coe-eyebrow">ENGINEERING CONSULTANCY</span>
              <h2 id="siemens-plm-services-heading">Services</h2>
              <p>
                The centre offers consultation and engineering services to develop sustainable
                solutions for customer needs and industrial applications.
              </p>
            </div>
            <div className="siemens-plm-service-grid">
              {services.map(({ title, description, icon: Icon }, index) => (
                <article className={`siemens-plm-service-card${index === 1 ? " is-light" : ""}`} key={title}>
                  <Icon size={32} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="siemens-plm-certification-section" aria-labelledby="siemens-plm-certification-heading">
          <div className="coe-page-container siemens-plm-certification-inner">
            <div>
              <span className="coe-eyebrow">INDUSTRY-RECOGNIZED LEARNING</span>
              <h2 id="siemens-plm-certification-heading">Joint Certification</h2>
              <p>
                Participants who successfully complete the training receive joint certification
                from AKGEC and Siemens PLM. NX certification helps strengthen students&apos;
                credentials with an industry-recognized qualification.
              </p>
              <p>{centre.recognition}</p>
            </div>
            <div className="siemens-plm-certificate-mark" aria-label="AKGEC Siemens PLM joint certification">
              <Image
                src={centre.image}
                alt="Students learning product lifecycle management software"
                fill
                sizes="(max-width: 760px) 280px, 250px"
                unoptimized={shouldBypassImageOptimization(centre.image)}
              />
              <small>PRODUCT LIFECYCLE MANAGEMENT</small>
              <Award size={32} aria-hidden="true" />
              <strong>Joint certification</strong>
              <em>Digital product engineering</em>
            </div>
          </div>
        </section>

        <section className="siemens-plm-projects-section" aria-labelledby="siemens-plm-projects-heading">
          <div className="coe-page-container">
            <div className="siemens-plm-section-heading">
              <span className="coe-eyebrow">DESIGN · ANALYZE · BUILD</span>
              <h2 id="siemens-plm-projects-heading">Projects</h2>
              <p>
                Trainees use advanced software and engineering tools to develop innovative concepts
                and machines that support industry and society.
              </p>
            </div>
            <div className="siemens-plm-project-grid">
              {projects.map(({ title, description, icon: Icon }) => (
                <article className="siemens-plm-project-card" key={title}>
                  <span className="siemens-plm-project-icon"><Icon size={26} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="siemens-plm-outcomes-section" aria-labelledby="siemens-plm-outcomes-heading">
          <div className="coe-page-container">
            <div>
              <span className="coe-eyebrow">CAREER OUTCOMES</span>
              <h2 id="siemens-plm-outcomes-heading">Skills for engineering careers</h2>
              <p>
                PLM training supports pathways in mechanical engineering, robotics, quality
                engineering and digital product development.
              </p>
            </div>
            <div className="siemens-plm-outcome-roles">
              <span><DraftingCompass size={18} aria-hidden="true" /> Product design</span>
              <span><Bot size={18} aria-hidden="true" /> Robotics engineering</span>
              <span><Gauge size={18} aria-hidden="true" /> Quality engineering</span>
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
