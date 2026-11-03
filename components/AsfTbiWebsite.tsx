"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Factory,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { AsfTbiContent } from "@/lib/asfTbiContent";
import AsfTbiApplicationModal from "@/components/AsfTbiApplicationModal";
import AsfTbiCarousel from "@/components/AsfTbiCarousel";
import AsfTbiHeroSlider from "@/components/AsfTbiHeroSlider";

type Props = { content: AsfTbiContent };

const facilityIcons = [Building2, Users, MessageCircle, FlaskConical, Wrench, Factory];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionTimer = window.setTimeout(() => setCount(value), 0);
      return () => window.clearTimeout(reducedMotionTimer);
    }

    let frame = 0;
    const steps = 30;
    const timer = window.setInterval(() => {
      frame += 1;
      setCount(Number(((value * Math.min(frame / steps, 1))).toFixed(1)));
      if (frame >= steps) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [value]);

  return <>{Number.isInteger(value) ? Math.round(count) : count.toFixed(1)}{suffix}</>;
}

function SectionIntro({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className={`tbi-section-intro${light ? " tbi-section-intro-light" : ""}`}>
      <span className="tbi-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function mailto(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AsfTbiWebsite({ content }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [industry, setIndustry] = useState("All");
  const [startupSearch, setStartupSearch] = useState("");
  const [eventView, setEventView] = useState<"upcoming" | "previous">("upcoming");

  const industries = useMemo(
    () => ["All", ...new Set(content.startups.map((startup) => startup.industry))],
    [content.startups]
  );
  const startups = useMemo(() => {
    const query = startupSearch.trim().toLowerCase();
    return content.startups.filter((startup) =>
      (industry === "All" || startup.industry === industry) &&
      (!query || `${startup.name} ${startup.industry} ${startup.description} ${startup.founder}`.toLowerCase().includes(query))
    );
  }, [content.startups, industry, startupSearch]);
  const events = content.events.filter((event) => event.status === eventView);

  const closeApplication = useCallback(() => setApplicationOpen(false), []);

  function navigateToSection(event: MouseEvent<HTMLElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    setMenuOpen(false);
    window.history.pushState(null, "", `#${encodeURIComponent(id)}`);
    const headerHeight = document.querySelector<HTMLElement>(".tbi-header")?.offsetHeight ?? 0;
    const top = window.scrollY + section.getBoundingClientRect().top - headerHeight - 16;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <main className="tbi-site" onClick={navigateToSection}>
      <div className="tbi-topline">
        <div className="tbi-container tbi-topline-inner">
          <span>{content.organization.name} <i aria-hidden="true">/</i> {content.organization.subtitle}</span>
        </div>
      </div>

      <header className="tbi-header">
        <div className="tbi-container tbi-header-inner">
          <Link href="/asf-tbi" className="tbi-brand" aria-label="ASF-TBI home">
            <Image src="/logo/asf-logo.png" alt="AKGEC Skills Foundation" width={74} height={74} preload />
            <span><strong>ASF<span>·</span>TBI</strong><small>TECHNOLOGY BUSINESS INCUBATOR</small></span>
          </Link>
          <nav className={`tbi-nav${menuOpen ? " tbi-nav-open" : ""}`} aria-label="Main navigation">
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#programs" onClick={() => setMenuOpen(false)}>Programs</a>
            <a href="#startups" onClick={() => setMenuOpen(false)}>Startups</a>
            <a href="#events" onClick={() => setMenuOpen(false)}>Events</a>
            <a href="#resources" onClick={() => setMenuOpen(false)}>Resources</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <button className="tbi-header-cta" type="button" onClick={() => setApplicationOpen(true)}>Apply for incubation <ArrowUpRight size={16} /></button>
          <button className="tbi-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <AsfTbiHeroSlider hero={content.hero} onApply={() => setApplicationOpen(true)} />

      <section className="tbi-stats" aria-label="Demonstration impact figures">
        <div className="tbi-container">
          <p className="tbi-demo-label"><span />Illustrative demonstration figures — not official ASF-TBI results</p>
          <div className="tbi-stats-grid">
            {content.stats.map((stat, index) => (
              <motion.div className="tbi-stat" key={`${stat.label}-${index}`} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ delay: index * 0.06 }}>
                <strong><Counter value={stat.value} suffix={stat.suffix} /></strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="tbi-section tbi-about" id="about">
        <div className="tbi-container">
          <div className="tbi-about-grid">
            <div className="tbi-about-copy">
              <SectionIntro eyebrow={content.about.label} title={content.about.title} />
              <p className="tbi-about-lead">{content.about.lead}</p>
              <p className="tbi-body-copy">{content.about.description}</p>
              <a className="tbi-text-link" href="#application">Find your starting point <ArrowRight size={17} /></a>
            </div>
            <div className="tbi-purpose-card">
              <div className="tbi-purpose-item"><span className="tbi-icon-box"><Lightbulb size={21} /></span><div><span className="tbi-eyebrow">Our vision</span><p>{content.about.vision}</p></div></div>
              <div className="tbi-purpose-divider" />
              <div className="tbi-purpose-item"><span className="tbi-icon-box tbi-icon-box-orange"><Sparkles size={21} /></span><div><span className="tbi-eyebrow">Our mission</span><p>{content.about.mission}</p></div></div>
            </div>
          </div>
          <div className="tbi-objectives">
            <div><span className="tbi-eyebrow">What we work toward</span><h3>Good ideas deserve<br />a path to move forward.</h3></div>
            <ul>{content.about.objectives.map((objective) => <li key={objective}><Check size={17} />{objective}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="tbi-section tbi-startups-section" id="startups">
        <div className="tbi-container">
          <SectionIntro eyebrow="The startup community" title="Early ideas. Real ambition." description="Meet a sample of the founders and ventures represented in this illustrative portfolio." />
          <div className="tbi-portfolio-note"><ShieldCheck size={17} />These example startup profiles are illustrative demonstration content, not an official ASF-TBI portfolio.</div>
          <div className="tbi-portfolio-toolbar">
            <div className="tbi-filter-list" aria-label="Filter startups by industry">
              {industries.map((category) => <button key={category} type="button" className={industry === category ? "active" : ""} onClick={() => setIndustry(category)} aria-pressed={industry === category}>{category}</button>)}
            </div>
            <label className="tbi-search"><Search size={17} /><span className="tbi-visually-hidden">Search startups</span><input value={startupSearch} onChange={(event) => setStartupSearch(event.target.value)} placeholder="Search startups" /></label>
          </div>
          {startups.length > 0 ? <AsfTbiCarousel label="Startup portfolio" className="tbi-startup-carousel">
            {startups.map((startup, index) => <motion.article className="tbi-startup-card" key={startup.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: Math.min(index * 0.06, 0.3) }}>
              <div className={`tbi-startup-mark tbi-startup-mark-${index % 4}`}>{startup.initials}</div>
              <span className="tbi-card-tag">{startup.industry}</span>
              <h3>{startup.name}</h3>
              <p>{startup.description}</p>
              <div className="tbi-startup-meta"><span>Founder <strong>{startup.founder}</strong></span><span>{startup.stage}</span></div>
            </motion.article>)}
          </AsfTbiCarousel> : <p className="tbi-empty-state">No startups match your search. Try another name or industry.</p>}
        </div>
      </section>

      <section className="tbi-section tbi-programs-section" id="programs">
        <div className="tbi-container">
          <SectionIntro eyebrow="A path for every stage" title="Make your next move count." description="Flexible ways to explore, test and develop your entrepreneurial journey." />
          <div className="tbi-program-grid">
            {content.programs.map((program, index) => {
              const ProgramIcon = [Lightbulb, Wrench, Building2, GraduationCap, ArrowUpRight, Sparkles][index % 6];
              return <article className="tbi-program-card" key={program.title}>
                <span className="tbi-program-number">0{index + 1}</span><span className="tbi-program-icon"><ProgramIcon size={23} /></span>
                <h3>{program.title}</h3><p>{program.description}</p>
                <div className="tbi-program-detail"><span>Who it’s for</span>{program.eligibility}</div>
                <div className="tbi-benefits">{program.benefits.map((benefit) => <span key={benefit}><Check size={13} />{benefit}</span>)}</div>
                <a href="#application">Learn more <ArrowRight size={16} /></a>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="tbi-section tbi-funding-section" id="funding">
        <div className="tbi-container">
          <SectionIntro eyebrow="Explore the landscape" title="Funding, with clarity." description="Understand possible pathways and prepare to explore external opportunities that fit your venture." />
          <div className="tbi-funding-alert"><ShieldCheck size={18} /><p><strong>Illustrative information only.</strong> These examples are not approved ASF-TBI schemes, funding offers or commitments. External eligibility, availability and decisions are set by each funder.</p></div>
          <div className="tbi-funding-grid">
            {content.funding.map((item) => <article className="tbi-funding-card" key={item.title}>
              <div className="tbi-funding-icon"><Wallet size={20} /></div><span className="tbi-card-tag">{item.category}</span><h3>{item.title}</h3>
              <div className="tbi-funding-range">{item.range}</div><p>{item.benefit}</p>
              <details><summary>Eligibility & information <ChevronDown size={16} /></summary><p>{item.eligibility}</p><small>{item.notice}</small></details>
            </article>)}
          </div>
        </div>
      </section>

      <section className="tbi-section tbi-mentors-section" id="mentors">
        <div className="tbi-container">
          <SectionIntro eyebrow="Learn from experience" title="A thoughtful network makes a difference." description="Illustrative mentor profiles show the kinds of perspectives founders may seek as they grow." />
          <p className="tbi-portfolio-note"><Users size={17} />Mentor profiles below are examples, not representations of actual ASF-TBI affiliations.</p>
          <AsfTbiCarousel label="Mentors" className="tbi-mentor-carousel">
            {content.mentors.map((mentor, index) => <article className="tbi-mentor-card" key={mentor.name}>
              <div className={`tbi-mentor-avatar tbi-mentor-avatar-${index % 4}`}>{mentor.initials}</div><span className="tbi-card-tag">{mentor.organization}</span>
              <h3>{mentor.name}</h3><strong>{mentor.title}</strong><p>{mentor.experience}</p>
              <div className="tbi-expertise"><span>Areas of expertise</span>{mentor.expertise}</div>
              <a href="#contact">Ask about mentoring <ArrowUpRight size={15} /></a>
            </article>)}
          </AsfTbiCarousel>
        </div>
      </section>

      <section className="tbi-section tbi-facilities-section" id="facilities">
        <div className="tbi-container">
          <SectionIntro eyebrow="Space to experiment" title="A home for hands-on progress." description="Explore the types of spaces and technical resources that may support a founder’s next step." />
          <AsfTbiCarousel label="Facilities" className="tbi-facility-carousel">
            {content.facilities.map((facility, index) => {
              const FacilityIcon = facilityIcons[index % facilityIcons.length];
              return <article className="tbi-facility-card" key={facility.title}>
                <div className="tbi-facility-image"><Image src={facility.image} alt="" fill sizes="(max-width: 650px) 88vw, (max-width: 900px) 46vw, 31vw" unoptimized={facility.image.startsWith("https://")} /></div>
                <div className="tbi-facility-content"><span><FacilityIcon size={22} /></span><h3>{facility.title}</h3><p>{facility.description}</p></div>
              </article>;
            })}
          </AsfTbiCarousel>
          <p className="tbi-small-note">Facility access, availability and usage requirements are subject to confirmation with the ASF-TBI team.</p>
        </div>
      </section>

      <section className="tbi-section tbi-events-section" id="events">
        <div className="tbi-container">
          <div className="tbi-section-row"><SectionIntro eyebrow="Gather, learn, build" title="Meet the ecosystem in action." description="Workshops, conversations and challenges for curious founders and innovators." />
            <div className="tbi-event-toggle" role="group" aria-label="Choose event period"><button type="button" className={eventView === "upcoming" ? "active" : ""} onClick={() => setEventView("upcoming")}>Upcoming</button><button type="button" className={eventView === "previous" ? "active" : ""} onClick={() => setEventView("previous")}>Previous</button></div>
          </div>
          <p className="tbi-portfolio-note"><CalendarDays size={17} />Sample event listings for demonstration; please confirm dates and registration with ASF-TBI.</p>
          {events.length ? <AsfTbiCarousel label={`${eventView} events`} className="tbi-event-carousel">
            {events.map((event) => <article className="tbi-event-card" key={event.title}>
              <div className="tbi-event-date"><span>{new Date(`${event.date}T12:00:00`).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</span><strong>{new Date(`${event.date}T12:00:00`).getDate()}</strong></div>
              <div className="tbi-event-info"><span className="tbi-card-tag">{event.kind}</span><h3>{event.title}</h3><p>{event.description}</p><div className="tbi-event-meta"><span><MapPin size={14} />{event.location}</span><span><Clock3 size={14} />{new Date(`${event.date}T12:00:00`).toLocaleDateString("en-IN", { year: "numeric" })}</span></div></div>
              {eventView === "upcoming" ? <a href={mailto(content.contact.email, `Event enquiry: ${event.title}`, "Hello ASF-TBI team, please share event details and registration information.")} className="tbi-event-register">Register <ArrowUpRight size={16} /></a> : <span className="tbi-event-complete">Event concluded</span>}
            </article>)}
          </AsfTbiCarousel> : <p className="tbi-empty-state">There are no {eventView} events listed right now.</p>}
        </div>
      </section>

      <section className="tbi-section tbi-news-section" id="news">
        <div className="tbi-container">
          <SectionIntro eyebrow="Ideas worth sharing" title="Notes from the startup journey." description="Perspectives on entrepreneurship, technology and turning insight into action." />
          <AsfTbiCarousel label="News and articles" className="tbi-news-carousel">
            {content.articles.map((article, index) => <article className="tbi-news-card" key={article.slug}>
              <div className={`tbi-news-art tbi-news-art-${index % 3}`}><span>{article.category}</span><Sparkles size={27} /></div>
              <div className="tbi-news-copy"><div className="tbi-news-meta"><span><CalendarDays size={14} />{new Date(`${article.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><span>{article.readTime}</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><Link href={`/asf-tbi/news/${encodeURIComponent(article.slug)}`}>Read article <ArrowRight size={16} /></Link></div>
            </article>)}
          </AsfTbiCarousel>
        </div>
      </section>

      <section className="tbi-section tbi-careers-section" id="careers">
        <div className="tbi-container">
          <SectionIntro eyebrow="Build with us" title="Bring your energy to the ecosystem." description="Sample roles for people who want to support founders, programs and innovation." />
          <div className="tbi-career-grid">
            {content.careers.map((role) => <article className="tbi-career-card" key={role.title}>
              <span className="tbi-card-tag">{role.department}</span><h3>{role.title}</h3><p>{role.description}</p>
              <dl><div><dt>Qualification</dt><dd>{role.qualification}</dd></div><div><dt>Experience</dt><dd>{role.experience}</dd></div></dl>
              <a href={mailto(role.applicationEmail, `Career enquiry: ${role.title}`, "Hello ASF-TBI team, I would like to know more about this opportunity.")}>Enquire about this role <ArrowUpRight size={16} /></a>
            </article>)}
          </div>
          <p className="tbi-small-note">These are sample vacancy descriptions, not current job openings. Please confirm availability with the incubation team.</p>
        </div>
      </section>

      <section className="tbi-section tbi-application-section" id="application">
        <div className="tbi-container">
          <div className="tbi-application-header"><div><span className="tbi-eyebrow">Your next chapter</span><h2>{content.application.title}</h2><p>{content.application.description}</p></div><button type="button" className="tbi-button tbi-button-primary" onClick={() => setApplicationOpen(true)}>Apply now <ArrowUpRight size={17} /></button></div>
          <div className="tbi-application-grid">
            <div className="tbi-application-list">
              <h3><span>01</span>Eligibility</h3><ul>{content.application.eligibility.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
              <h3><span>02</span>Application process</h3><ol>{content.application.process.map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</li>)}</ol>
              <h3><span>03</span>Documents to prepare</h3><ul>{content.application.documents.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
            </div>
            <aside className="tbi-application-aside">
              <div><span className="tbi-eyebrow">What we look for</span><h3>Potential, commitment and a clear next step.</h3><ul>{content.application.evaluation.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div className="tbi-criteria"><h4>Selection considerations</h4><ul>{content.application.criteria.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </aside>
          </div>
          <div className="tbi-faq">
            <span className="tbi-eyebrow">Good to know</span><h3>Frequently asked questions</h3>
            {content.application.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<ChevronDown size={18} /></summary><p>{faq.answer}</p></details>)}
            <p className="tbi-small-note">Submitting an application does not guarantee selection, incubation or funding. The team will share current eligibility and next steps.</p>
          </div>
        </div>
      </section>

      <section className="tbi-section tbi-partners-section" id="partners">
        <div className="tbi-container">
          <SectionIntro eyebrow="A connected ecosystem" title="Progress grows through collaboration." description="We value the people and institutions that help founders learn, test and make progress." />
          <p className="tbi-portfolio-note"><ShieldCheck size={17} />The labels below describe illustrative partner categories, not confirmed ASF-TBI partnerships.</p>
          <div className="tbi-partner-grid">{content.partners.map((partner) => <div className="tbi-partner-card" key={partner.name}><span>{partner.monogram}</span><strong>{partner.name}</strong><small>{partner.category}</small></div>)}</div>
        </div>
      </section>

      <section className="tbi-section tbi-resources-section" id="resources">
        <div className="tbi-container">
          <SectionIntro eyebrow="Useful to have close" title="Resources for the road ahead." description="Find a starting point for understanding the incubator and preparing your next step." />
          <div className="tbi-resource-grid">{content.resources.map((resource, index) => <article className="tbi-resource-card" key={resource.title}><span className="tbi-resource-index">0{index + 1}</span><span className="tbi-card-tag">{resource.kind}</span><h3>{resource.title}</h3><p>{resource.description}</p>{resource.href ? <a href={resource.href} target="_blank" rel="noreferrer">View resource <ArrowUpRight size={16} /></a> : <span className="tbi-resource-status">{resource.availability}</span>}</article>)}</div>
        </div>
      </section>

      <section className="tbi-contact-section" id="contact">
        <div className="tbi-container">
          <div className="tbi-contact-heading"><span className="tbi-eyebrow">Let’s start a conversation</span><h2>Every big journey<br />starts with <em>a hello.</em></h2><p>Have an idea or a question about incubation? Reach out to the ASF-TBI team.</p></div>
          <div className="tbi-contact-grid">
            <div className="tbi-contact-details">
              <a className="tbi-contact-card" href={`mailto:${content.contact.email}`}><span><Mail size={20} /></span><div><small>Email the incubator</small><strong>{content.contact.email}</strong></div><ArrowUpRight size={17} /></a>
              <a className="tbi-contact-card" href={`tel:${content.contact.phone.replace(/[^\d+]/g, "")}`}><span><Phone size={20} /></span><div><small>Call our team</small><strong>{content.contact.phone}</strong></div><ArrowUpRight size={17} /></a>
              <div className="tbi-contact-address"><span><MapPin size={20} /></span><div><small>Find us at AKGEC</small><strong>{content.contact.organization}</strong><p>{content.contact.address}</p><a className="tbi-map-link" href={content.contact.mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={14} /></a></div></div>
              <div className="tbi-social-links">{content.social.map((link) => <a href={link.url} key={link.platform} target="_blank" rel="noreferrer" aria-label={`${link.platform}${link.placeholder ? " (placeholder)" : ""}`}>{link.platform}<ArrowUpRight size={13} />{link.placeholder && <small>placeholder</small>}</a>)}</div>
            </div>
            <div className="tbi-contact-visual">
              <div className="tbi-map"><iframe title="Map showing Ajay Kumar Garg Engineering College in Ghaziabad" src={`https://www.google.com/maps?q=${encodeURIComponent(content.contact.address)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
              <div className="tbi-contact-visual-caption"><span>Have an idea?</span><strong>Let’s build your next step together.</strong><button type="button" className="tbi-button tbi-button-primary" onClick={() => setApplicationOpen(true)}>Apply to ASF-TBI <ArrowRight size={16} /></button></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="tbi-footer">
        <div className="tbi-container">
          <div className="tbi-footer-main">
            <Link href="/asf-tbi" className="tbi-brand tbi-footer-brand"><Image src="/logo/asf-logo.png" alt="" width={50} height={50} /><span><strong>ASF<span>·</span>TBI</strong><small>{content.organization.name}</small></span></Link>
            <p>{content.organization.tagline}</p>
            <nav aria-label="Footer navigation"><a href="#about">About</a><a href="#programs">Programs</a><a href="#application">Apply</a><a href="#contact">Contact</a><Link href="/admin/asf-tbi">Admin</Link></nav>
          </div>
          <div className="tbi-footer-bottom"><span>© {new Date().getFullYear()} {content.organization.name} · {content.organization.subtitle}</span><span>Sample portfolio and figures are illustrative.</span></div>
          <Link className="tbi-foundation-link" href="/">Visit the AKGEC Skills Foundation website <ArrowUpRight size={14} /></Link>
        </div>
      </footer>
      <AsfTbiApplicationModal open={applicationOpen} email={content.contact.email} fields={content.applicationForm.customFields} onClose={closeApplication} />
    </main>
  );
}
