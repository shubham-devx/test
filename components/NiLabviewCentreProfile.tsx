import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cog,
  Gauge,
} from "lucide-react";
import CentreRegistrationAction from "@/components/CentreRegistrationAction";
import CoeTrainingHeader from "@/components/CoeTrainingHeader";
import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type Centre = SiteContent["centresList"][number];

const programs = [
  {
    title: "LabVIEW CORE - I & II",
    description:
      "Build core skills with LabVIEW, a graphical programming environment for test, measurement and control applications.",
    icon: Cog,
  },
  {
    title: "LabVIEW CORE III & Connectivity",
    description:
      "Explore advanced LabVIEW concepts and connectivity for connected measurement and control systems.",
    icon: Gauge,
  },
  {
    title: "IIoT & Machine Vision",
    description:
      "Learn how connected devices, measurement and machine vision can support industrial applications.",
    icon: Boxes,
  },
];

const platforms = [
  "PXI Systems",
  "CompactRIO",
  "CompactDAQ with I/O modules",
  "myDAQ",
  "myRIO",
  "sbRIO",
  "USB DAQ Card",
  "Analog Discovery Cards",
];

export default function NiLabviewCentreProfile({
  centre,
  course,
}: {
  centre: Centre;
  course?: Course;
}) {
  return (
    <div className="coe-page nilab-page">
      <CoeTrainingHeader />
      <main>
        <section className="nilab-hero">
          <Image
            src={centre.image}
            alt="Students learning in the NI LabVIEW Academy"
            fill
            priority
            sizes="100vw"
            unoptimized={shouldBypassImageOptimization(centre.image)}
          />
          <div className="nilab-hero-shade" />
          <div className="nilab-hero-content coe-page-container">
            <Link href="/coe-training" className="nilab-back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All centres
            </Link>
            <p className="nilab-hero-kicker">Test · Measurement · Control · Industrial IoT</p>
            <h1>NI LabVIEW Academy</h1>
            <p className="nilab-hero-description">
              Build engineering skills and develop practical solutions with LabVIEW, measurement
              hardware and connected control technologies.
            </p>
            <div className="nilab-hero-actions">
              <a href="#nilab-programmes">Explore programmes <ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#nilab-platforms">Explore platforms</a>
            </div>
          </div>
        </section>

        <section className="nilab-about-section" aria-labelledby="nilab-about-heading">
          <div className="coe-page-container">
            <div className="nilab-section-heading">
              <span className="coe-eyebrow">NATIONAL INSTRUMENTS · PLANET NI</span>
              <h2 id="nilab-about-heading">About the Academy</h2>
              <p>
                NI LabVIEW Academy is an initiative of National Instruments under its Planet NI
                (Nurturing Innovation) framework. It supports the employability of engineering
                graduates and helps local industry address test, measurement and control challenges
                with cost-effective solutions.
              </p>
            </div>
            <div className="nilab-about-grid">
              <div className="nilab-about-image">
                <Image
                  src={centre.image}
                  alt="NI LabVIEW Academy computer laboratory"
                  fill
                  sizes="(max-width: 760px) 100vw, 48vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
              </div>
              <div className="nilab-overview">
                <span className="nilab-date-chip">Established April 2012</span>
                <h3>A Centre of Excellence in Industrial IoT</h3>
                <p>
                  The Academy is designated as a Centre of Excellence in Industrial Internet of
                  Things (IIoT), bringing academia and industry together to apply connected
                  measurement and control technologies.
                </p>
                <p>
                  Its approach combines flexible software with measurement and control hardware,
                  helping equip connected devices to support uptime, performance and innovation.
                </p>
                <div className="nilab-focus-list">
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Test &amp; measurement</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Control systems</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Industrial IoT</span>
                  <span><CheckCircle2 size={16} aria-hidden="true" /> Machine vision</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="nilab-programmes-section" id="nilab-programmes" aria-labelledby="nilab-programmes-heading">
          <div className="coe-page-container">
            <div className="nilab-section-heading">
              <span className="coe-eyebrow">TRAINING &amp; WORKSHOPS</span>
              <h2 id="nilab-programmes-heading">Training Programmes</h2>
              <p>
                LabVIEW and IIoT programmes support hands-on learning for engineering students and
                industry professionals.
              </p>
            </div>
            <div className="nilab-programme-grid">
              {programs.map(({ title, description, icon: Icon }) => (
                <article className="nilab-programme-card" key={title}>
                  <span className="nilab-programme-icon"><Icon size={25} aria-hidden="true" /></span>
                  <span className="nilab-programme-type">Academy programme</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className="nilab-impact-strip" aria-label="Academy activity reported in the centre brief">
              <div><strong>50+</strong><span>training programmes</span></div>
              <div><strong>800+</strong><span>students trained</span></div>
              <div><strong>400+</strong><span>one-day workshops</span></div>
              <p>Reported activity for students and industry professionals.</p>
            </div>
            <div className="nilab-registration-panel">
              <div>
                <span className="coe-eyebrow">JOIN A PROGRAMME</span>
                <h3>Plan your LabVIEW training</h3>
                {course ? (
                  <>
                    <p className="nilab-course-name">{course.name} — current catalogue fees</p>
                    <div className="nilab-course-fees">
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

        <section className="nilab-platforms-section" id="nilab-platforms" aria-labelledby="nilab-platforms-heading">
          <div className="coe-page-container nilab-platforms-grid">
            <div className="nilab-platforms-copy">
              <span className="coe-eyebrow">SOFTWARE &amp; HARDWARE</span>
              <h2 id="nilab-platforms-heading">Platforms for connected measurement and control</h2>
              <p>
                The centre combines commercial technologies and flexible software with measurement
                and control hardware for training and industrial applications.
              </p>
              <div className="nilab-platform-tags">
                {platforms.map((platform) => <span key={platform}>{platform}</span>)}
              </div>
            </div>
            <div className="nilab-platform-callout">
              <span className="nilab-callout-icon"><Gauge size={28} aria-hidden="true" /></span>
              <h3>From signals to insight</h3>
              <p>
                Develop practical understanding of acquiring data, connecting systems and applying
                measurement and control technologies to engineering challenges.
              </p>
              <div><Cog size={17} aria-hidden="true" /> LabVIEW-based learning</div>
              <div><Boxes size={17} aria-hidden="true" /> Connected hardware platforms</div>
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
