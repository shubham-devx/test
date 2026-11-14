import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Factory,
  Scissors,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type Centre = SiteContent["centresList"][number];

const programs = [
  { type: "Training", title: "Welder Competency Program", skills: "Basic | Advance", duration: "Two weeks", audience: "For welders", icon: Flame },
  { type: "Industrial training program", title: "Welding & Inspection Technology", skills: "Technician | Engineer", duration: "Six weeks", audience: "Summer programme for students", icon: ClipboardCheck },
  { type: "Workshop", title: "Welding Technology", skills: "Arc welding | NDT", duration: "One day", audience: "For beginners", icon: Wrench },
  { type: "Training", title: "Industrial Welding Training", skills: "Basic | Advance", duration: "Two weeks", audience: "For engineers", icon: Flame },
  { type: "On-site training", title: "Welder Training Program", skills: "SMAW | GMAW | GTAW", duration: "On-site programme", audience: "For welders & supervisors", icon: Factory },
  { type: "Industrial internship", title: "Welding and Inspection", skills: "Arc welding | NDT | Plasma cutting", duration: "Six months", audience: "For students", icon: ClipboardCheck },
  { type: "Training", title: "Certification Program in NDT", skills: "Basic | Advance", duration: "Two weeks", audience: "For students", icon: Award },
];

const facilities = [
  "Fronius digital inverter welding sources for SMAW, GMAW and GTAW, with welding simulators.",
  "Advanced Synergic Pulse GMAW and Cold Wire Transfer GTAW setups.",
  "25 welding stations with Nederman fume extraction and a central gas manifold system commissioned by Messer Cutting Systems.",
  "Customizable welding trainer tables and modular fixtures for accurately positioning workpieces.",
  "A dedicated thermal-cutting section for gas welding, brazing and cutting, with a Messer CNC plasma-cutting machine.",
];

const services = [
  {
    title: "Non-Destructive Testing",
    points: ["Liquid Penetrant Testing", "Magnetic Particle Testing", "Ultrasonic Testing"],
    icon: ShieldCheck,
  },
  {
    title: "Laser & Plasma Cutting",
    points: ["Manual Plasma Cutting", "CNC Plasma Cutting", "Laser Cutting"],
    icon: Scissors,
  },
  {
    title: "Fabrication",
    points: ["Thermal Cutting", "Welding, Brazing & Oxyacetylene", "Finishing, burr removal & grinding"],
    icon: Factory,
  },
];

const projects = [
  {
    title: "Techno-economic Study of Welding Processes",
    description:
      "A study of SMAW, GMAW and GTAW to compare process efficiency and identify welding parameters that balance production cost with joint strength.",
    icon: ClipboardCheck,
  },
  {
    title: "Stainless Steel Cladding",
    description:
      "Weld parameters were optimized and mechanical testing performed for stainless-steel cladding over low-carbon steel using the GMAW process.",
    icon: Flame,
  },
  {
    title: "Bullock-Driven Tractor",
    description:
      "AWTRC fabricated a modified bullock-driven tractor in association with IIT Delhi's Rural Technology Action Group (RuTAG), for operations including ploughing and harrowing.",
    icon: Factory,
  },
];

export default function FroniusCentreProfile({
  centre,
  course,
}: {
  centre: Centre;
  course?: Course;
}) {
  return (
    <div className="coe-page fronius-centre-page">
      <CoeTrainingHeader />
      <main>
        <section className="fronius-hero">
          <Image
            src={centre.image}
            alt="Learners practising welding at the welding technology centre"
            fill
            priority
            sizes="100vw"
            unoptimized={shouldBypassImageOptimization(centre.image)}
          />
          <div className="fronius-hero-shade" />
          <div className="fronius-hero-content coe-page-container">
            <Link href="/coe-training" className="fronius-back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All centres
            </Link>
            <p className="fronius-hero-kicker">Welding · Thermal Cutting · Inspection</p>
            <h1>Advance Welding Technology &amp; Research Centre</h1>
            <p className="fronius-hero-description">
              Industry-oriented training, research and industrial solutions in welding science,
              engineering and technology.
            </p>
            <div className="fronius-hero-actions">
              <a href="#fronius-programmes">Explore training <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#fronius-services">Explore services</a>
            </div>
          </div>
        </section>

        <section className="fronius-about-section" aria-labelledby="fronius-about-heading">
          <div className="coe-page-container">
            <div className="fronius-section-heading">
              <span className="coe-eyebrow">AKGEC × FRONIUS INTERNATIONAL</span>
              <h2 id="fronius-about-heading">About the Centre</h2>
              <p>
                {centre.description} Jointly established in November 2014, the centre operates
                under the aegis of AKGEC Skills Foundation at Ajay Kumar Garg Engineering College,
                Ghaziabad. AWTRC develops a skilled workforce and delivers cost-effective
                industrial solutions through training, research, development and consultancy.
              </p>
            </div>
            <div className="fronius-about-grid">
              <div className="fronius-about-image">
                <Image
                  src={centre.image}
                  alt="Welding equipment used for practical training"
                  fill
                  sizes="(max-width: 760px) 100vw, 48vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
              </div>
              <div className="fronius-facilities">
                <h3>Welding, cutting and inspection facilities</h3>
                <ul>
                  {facilities.map((facility) => (
                    <li key={facility}><CheckCircle2 size={19} aria-hidden="true" />{facility}</li>
                  ))}
                </ul>
                <p className="fronius-testing-note">
                  <strong>Testing:</strong> Destructive testing covers weld strength, hardness,
                  toughness and macro/micro examination. Non-destructive testing includes Magnetic
                  Particle, Liquid Penetrant, Ultrasonic and Eddy Current testing, plus X-ray film
                  interpretation of weld defects.
                </p>
                {centre.details?.[2] && <p className="fronius-centre-highlight">{centre.details[2]}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="fronius-programmes-section" id="fronius-programmes" aria-labelledby="fronius-programmes-heading">
          <div className="coe-page-container">
            <div className="fronius-section-heading">
              <span className="coe-eyebrow">LEARN BY DOING</span>
              <h2 id="fronius-programmes-heading">Training Programmes</h2>
              <p>
                Welding, cutting and inspection technology programmes for school learners, ITI and
                diploma students, undergraduates and practising industry professionals.
              </p>
            </div>
            <div className="fronius-programme-grid">
              {programs.map(({ type, title, skills, duration, audience, icon: Icon }) => (
                <article className="fronius-programme-card" key={title}>
                  <span className="fronius-programme-icon"><Icon size={24} aria-hidden="true" /></span>
                  <span className="fronius-programme-type">{type}</span>
                  <h3>{title}</h3>
                  <p>{skills}</p>
                  <div className="fronius-programme-meta">
                    <span>{duration}</span>
                    <span>{audience}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="fronius-registration-panel">
              <div>
                <span className="coe-eyebrow">JOIN A PROGRAMME</span>
                <h3>Plan your welding and inspection training</h3>
                {course ? (
                  <>
                    <p className="fronius-course-name">{course.name} — current catalogue fees</p>
                    <div className="fronius-course-fees">
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

        <section className="fronius-services-section" id="fronius-services" aria-labelledby="fronius-services-heading">
          <div className="coe-page-container">
            <div className="fronius-section-heading">
              <span className="coe-eyebrow">INDUSTRIAL SOLUTIONS</span>
              <h2 id="fronius-services-heading">Services</h2>
              <p>
                AWTRC helps industry improve quality, productivity and competitiveness through
                welding, thermal cutting and inspection technology.
              </p>
            </div>
            <div className="fronius-service-grid">
              {services.map(({ title, points, icon: Icon }, index) => (
                <article className={`fronius-service-card${index === 1 ? " is-light" : ""}`} key={title}>
                  <Icon size={32} aria-hidden="true" />
                  <h3>{title}</h3>
                  <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="fronius-certification-section" aria-labelledby="fronius-certification-heading">
          <div className="coe-page-container fronius-certification-inner">
            <div>
              <span className="coe-eyebrow">SKILLS RECOGNITION</span>
              <h2 id="fronius-certification-heading">Certification</h2>
              <p>
                To meet industry requirements, AWTRC offers AKGEC-FRONIUS certification for
                welders, technologists, welding engineers and inspectors, at competency levels
                aligned with relevant qualification and certification codes.
              </p>
              <p>
                After assessment, the centre also proposes certification through ASNT, AWS,
                IIW-India, CGSC, ASDC and TÜV Rheinland, subject to each body&apos;s requirements.
              </p>
            </div>
            <div className="fronius-certificate-mark" aria-label="AKGEC Fronius welding technology certification">
              <Image
                src={centre.image}
                alt="Hands-on welding training"
                fill
                sizes="(max-width: 760px) 280px, 250px"
                unoptimized={shouldBypassImageOptimization(centre.image)}
              />
              <small>ADVANCE WELDING TECHNOLOGY</small>
              <Award size={32} aria-hidden="true" />
              <strong>Training &amp; assessment</strong>
              <em>Welding · Inspection · NDT</em>
            </div>
          </div>
        </section>

        <section className="fronius-projects-section" aria-labelledby="fronius-projects-heading">
          <div className="coe-page-container">
            <div className="fronius-section-heading">
              <span className="coe-eyebrow">RESEARCH &amp; DEVELOPMENT</span>
              <h2 id="fronius-projects-heading">Projects</h2>
              <p>
                AWTRC undertakes welding and fabrication projects to address practical challenges
                faced by industry.
              </p>
            </div>
            <div className="fronius-project-grid">
              {projects.map(({ title, description, icon: Icon }) => (
                <article className="fronius-project-card" key={title}>
                  <span className="fronius-project-icon"><Icon size={26} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="fronius-outcomes-section" aria-labelledby="fronius-outcomes-heading">
          <div className="coe-page-container">
            <div>
              <span className="coe-eyebrow">CAREER OUTCOMES</span>
              <h2 id="fronius-outcomes-heading">From training to industry</h2>
              <p>
                AWTRC trainees have progressed into welding, engineering and application-support
                roles. Its programmes build practical skills for careers across welding and
                inspection.
              </p>
            </div>
            <div className="fronius-outcome-roles">
              <span><Flame size={18} aria-hidden="true" /> Welder</span>
              <span><Wrench size={18} aria-hidden="true" /> Welding engineer</span>
              <span><ClipboardCheck size={18} aria-hidden="true" /> Inspection professional</span>
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
