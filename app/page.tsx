"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  ChevronRight,
  Cpu,
  Factory,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Menu,
  MessageCircle,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import RegistrationModal from "@/components/RegistrationModal";

/* =====================================================
   WHATSAPP
   ===================================================== */
const ADMIN_WHATSAPP = "917518681245";

/* =====================================================
   SOCIAL LINKS
   Replace placeholder links later with official ASF URLs
   ===================================================== */

const SOCIAL = {
  linkedin:
    "https://in.linkedin.com/company/akgec-skills-foundation",
};



/* =====================================================
   WHATSAPP HELPER
   Builds a wa.me click-to-chat link with a pre-filled message.
   ===================================================== */

function whatsapp(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/* =====================================================
   NAVIGATION
   ===================================================== */

const navItems = [
  ["About Foundation", "#about"],
  ["Training", "#training"],
  ["Centres of Excellence", "#centres"],
  ["Industry", "#industry"],
  ["MoUs", "#mous"],
  ["Proud Moments", "#proud-moments"],
  ["Careers", "#placements"],
  ["Facilities", "#facilities"],
];

/* =====================================================
   TRAINING PROGRAMMES
   ===================================================== */

const trainingPrograms = [
  {
    icon: Bot,
    number: "01",
    title: "Industrial Robotics",
    text: "Robot Programming - Basic / Advance / Expert; robotic arc welding; robotic spot and ultrasonic welding; robotic milling and laser welding & cutting.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Automation & Control",
    text: "Integrated Automation, Industrial Automation, PLC/HMI/SCADA, drives and control, industrial hydraulics, industrial pneumatics, mechatronics and process instrumentation.",
  },
  {
    icon: Factory,
    number: "03",
    title: "Advanced Manufacturing",
    text: "CIM, CNC operation and programming for turning/milling/grinding, CAD/CAM, computer-aided analysis, additive manufacturing and digital manufacturing.",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Welding, Metrology & Drone",
    text: "Welding technology, ASNT Level-1 & 2, CMM and GD&T training, remote pilot training, agriculture drone spray and drone service technician programmes.",
  },
];

/* =====================================================
   CENTRES OF EXCELLENCE
   ===================================================== */

const centres = [
  {
    name: "KUKA Industrial Robotics Training Centre",
    partner: "KUKA Robotics",
    focus: "Industrial Robotics",
    description:
      "A robotics training centre established in collaboration with KUKA Robotics for industrial robotics training, research and industrial manufacturing or prototype services.",
    programs: [
      "Robot Programming - Basic / Advance / Expert",
      "Robotic Arc Welding (MIG / CMT / Time Twin)",
      "Robotic Spot Welding and Ultrasonic Welding",
      "Robotic Milling and Robotic LASER Welding & Cutting",
    ],
    recognition: "The brochure describes it as the first and largest robotics centre in the country and states that successful participants receive joint certification of AKGEC & KUKA.",
  },
  {
    name: "FRONIUS Advance Welding Technology & Research Centre",
    partner: "Fronius International",
    focus: "Welding, Thermal Cutting & NDT",
    description:
      "A state-of-the-art centre jointly established by AKGEC and Fronius International for training, research and development in welding science, engineering and technology.",
    programs: [
      "Certificate Course for Welding Technician",
      "Short Term Training Program on Welding Technology",
      "Competency Development Program for Arc Welders",
      "ASNT Level-1 & 2 Certification Program (VT, PT, MT & UT)",
    ],
    recognition: "The brochure describes it as the first state-of-the-art centre of its kind in Uttar Pradesh.",
  },
  {
    name: "SIEMENS Advance Manufacturing Centre",
    partner: "Siemens",
    focus: "Advanced Manufacturing",
    description:
      "A centre jointly established by AKGEC and Siemens at Ghaziabad to develop highly skilled technical manpower in advanced manufacturing.",
    programs: [
      "Computer Integrated Manufacturing (CIM)",
      "CNC Operation & Programming - Turning / Milling / Grinding",
      "Finishing School Program in Production Engineering",
    ],
    recognition: "Hands-on learning uses NC production machines for turning, milling and grinding with Siemens CNC controllers and simulators.",
  },
  {
    name: "NI LabVIEW Academy",
    partner: "National Instruments",
    focus: "Test, Measurement, Control & IIoT",
    description:
      "An initiative of National Instruments under the Planet NI framework, focused on employability and innovative solutions in test, measurement and control. The brochure also designates it as a Centre of Excellence in Industrial Internet of Things (IIoT).",
    programs: [
      "LabVIEW CORE - I & II",
      "LabVIEW CORE III & Connectivity",
      "IIoT & Machine Vision",
    ],
    recognition: "The academy is described as a Centre of Excellence in Industrial Internet of Things (IIoT).",
  },
  {
    name: "BOSCH Rexroth Centre of Competence in Automation Technologies",
    partner: "Bosch Rexroth AG, Germany",
    focus: "Automation Technologies",
    description:
      "A centre established in collaboration with Bosch Rexroth AG, Germany, to bridge the technological gap and provide training and research for engineering and manufacturing industries.",
    programs: [
      "Automation Technologies - Basic / Intermediate",
      "Industrial Hydraulics - Basic / Advance",
      "Industrial Pneumatics - Basic / Advance",
      "Mechatronics",
      "Industrial Networking",
      "Sensorics",
      "Motion Control",
    ],
    recognition: "The centre has six laboratories covering Hydraulics, Pneumatics, Sensorics, PLCs, Drives & Control and Mechatronics. Successful participants are awarded a joint certificate of AKGEC & BOSCH Rexroth.",
  },
  {
    name: "AIA Centre for Integrated Automation",
    partner: "Automation Industry Association (AIA)",
    focus: "Integrated Automation",
    description:
      "A centre jointly established by AKGEC and AIA to advance knowledge of automation applications in industries through theoretical and practical exposure.",
    programs: [
      "Integrated Automation : Basic",
      "Integrated Automation : Advance",
      "Integrated Automation : Expert",
      "Mechatronics",
      "Hydraulics",
      "Pneumatics",
    ],
    recognition: "The brochure describes world-class training infrastructure and working models based on innovative industrial applications.",
  },
  {
    name: "SIEMENS PLM Centre of Excellence",
    partner: "Siemens",
    focus: "Product Lifecycle Management & Manufacturing Operations",
    description:
      "A Siemens PLM centre using software for product lifecycle management and manufacturing operations management, including product design, analysis, manufacturing and simulation.",
    programs: [
      "CAD Tool: Solid Edge / NX",
      "CAM Programming using NX",
      "Computer Aided Analysis: FEMAP",
      "Design for Additive Manufacturing",
    ],
    recognition: "The brochure lists Siemens software including FEMAP, JACK, NX, ROBCAD, SOLIDEDGE, PLANT SIMULATION and PROCESS SIMULATE.",
  },
  {
    name: "MITSUBISHI Authorised Training Centre",
    partner: "Mitsubishi Electric India Pvt. Ltd.",
    focus: "Factory Automation, Drives, Control & Robotics",
    description:
      "An authorised training centre for factory automation at the AKGEC campus, established by Mitsubishi Electric India Pvt. Ltd. to bridge the technological gap and support applied research.",
    programs: [
      "PLC and HMI Programming",
      "SCADA: Monitoring & Control Systems",
      "Basic Course on Drive & Control",
      "Inverters & Servos",
    ],
    recognition: "The centre provides access to modular and micro controllers, inverters, servos and HMIs for high-end factory automation applications.",
  },
  {
    name: "FAB LAB Centre of Digital Manufacturing",
    partner: "FABLab / AKGEC",
    focus: "Digital Fabrication & Prototyping",
    description:
      "A technical prototyping platform for innovation and invention, providing a small-scale digital fabrication workshop for learning, experimentation and creation of smart devices.",
    programs: [
      "Embedded Systems",
      "PCB Design and Manufacturing",
      "Additive Manufacturing",
      "Digital Manufacturing",
      "Innovation Boot Camp",
      "Fab Academy Diploma Program",
    ],
    recognition: "The brochure describes the Fab Lab as a platform connecting learners, educators, technologists, researchers and innovators with a global knowledge-sharing network.",
  },
  {
    name: "BOSCH Joint Certification Centre",
    partner: "Bosch Ltd.",
    focus: "Automotive Technologies",
    description:
      "A joint certification centre established by AKGEC and Bosch Ltd. for automotive training with a balance of theory and practical learning.",
    programs: [
      "Automotive Technology - Essential / Intermediate / Advance",
      "Car Maintenance & Systems",
      "Automotive Service",
      "Vehicle Diagnostics",
      "Automotive Electrical & Electronics",
    ],
    recognition: "The centre offers essential, intermediate and advanced levels and hands-on training for engineers, technicians and mechanics.",
  },
  {
    name: "ZEISS Calibration & Testing Centre",
    partner: "ZEISS",
    focus: "Dimensional Metrology, Calibration & Testing",
    description:
      "An NABL-accredited facility established in collaboration with ZEISS to meet dimensional metrology requirements of industry.",
    programs: [
      "CMM - Operator Training",
      "CMM - Manager Training",
      "GD&T Training",
    ],
    recognition: "The brochure states that the facility provides NABL-accredited calibration services, reverse engineering services and dimensional testing services and complies with IS/ISO/IEC 17025:2017.",
  },
  {
    name: "JANATICS Industrial Pneumatic Knowledge Centre",
    partner: "Janatics India Pvt. Ltd.",
    focus: "Industrial Pneumatics & Automation",
    description:
      "An Industrial Pneumatic Knowledge Centre jointly established by AKGEC and Janatics India Pvt. Ltd. to develop skilled manpower in industrial pneumatics and support low-cost automation solutions for SMEs.",
    programs: [
      "Basic Pneumatics & Automation",
      "Certificate Program in Flexible Manufacturing System",
      "Electro Pneumatics & Advance Automation",
      "Plant & Machine Maintenance",
      "Pneumatics FMS Maintenance",
    ],
    recognition: "The brochure describes it as India's first Industrial Pneumatic Knowledge Centre and states that it also functions as an NSIC Training-cum-Incubation Centre.",
  },
  {
    name: "SIEMENS Centre of Excellence in Automation",
    partner: "Siemens",
    focus: "Industrial Automation",
    description:
      "Established in 2016 at AKGEC, Ghaziabad, this centre was developed with Siemens to bridge the gap between academia and industry through hands-on training and applied research.",
    programs: [
      "Industrial Automation - Basic / Advance",
      "Industrial AC & DC Drives - Basic / Advance",
      "SIMOCODE - Foundational Level",
      "Process Instrumentation & Control - Intermediate / Advance",
      "Switchgear - Basic Level",
    ],
    recognition: "The brochure describes four specialized laboratories equipped with PLCs, DCS, SCADA, HMI, drives and instrumentation systems.",
  },
  {
    name: "DGCA Certified Remote Pilot Training Drone Academy",
    partner: "AKGEC Skills Foundation",
    focus: "Drone Technology & UAV Training",
    description:
      "AKGEC Drone Academy is an initiative of ASF and a DGCA-Certified Remote Pilot Training Organization focused on drone technology education and training.",
    programs: [
      "Remote Pilot Training",
      "Agriculture Spray",
      "Agriculture Drone Spray",
      "Drone Service Technician",
    ],
    recognition: "DGCA-Certified Remote Pilot Training Organization (RPTO), Authorization No. 35/2024. The brochure lists a smartboard classroom, drone simulation lab, drone flying station and four DGCA type-certified drones.",
  },
];


/* =====================================================
   MoUs & PARTNERSHIPS
   ===================================================== */

const mouGroups = [
  {
    category: "Industry Partners",
    items: [
      { name: "KUKA Robotics India Pvt. Ltd.", purpose: "Establishment of a Center of Excellence providing state-of-the-art robotics technology, automation solutions and hands-on training." },
      { name: "NI System Pvt. Ltd.", purpose: "Establishment of a Center of Excellence serving as a hub for innovation, skill development and industry-academia collaboration." },
      { name: "Janatics India Pvt. Ltd.", purpose: "Promotion of startups through mentorship, resources and technical assistance, with a Centre of Excellence focused on pneumatics, automation and industrial solutions." },
      { name: "Bosch Rexroth India Ltd", purpose: "Establishment of a Centre of Excellence for advanced training, research and technology in industrial automation and drive solutions." },
      { name: "SIEMENS Industry Software", purpose: "Establishment of a Centre of Excellence for digital manufacturing, automation and engineering solutions." },
      { name: "Mitsubishi Electric India Pvt. Ltd.", purpose: "Establishment of a Centre of Excellence focused on industrial automation, robotics and smart manufacturing." },
      { name: "Schmalz India Pvt. Ltd.", purpose: "Establishment of a Centre of Excellence focused on vacuum automation and handling technology." },
      { name: "Pepperl+Fuchs India Pvt. Ltd.", purpose: "Establishment of a Centre of Excellence focused on industrial sensors, automation and IoT solutions." },
      { name: "Fronius India Pvt. Ltd.", purpose: "Establishment of a Centre of Excellence for welding automation and renewable energy solutions, supporting training, research and industry-academia collaboration." },
      { name: "Carl Zeiss India", purpose: "Establishment of a Centre of Excellence focused on precision optics, metrology and imaging solutions." },
      { name: "TUV Rheinland", purpose: "Collaboration for skill development, quality assurance, training, certification, testing, inspection and compliance." },
      { name: "Messer Cutting Systems India Pvt. Ltd.", purpose: "Collaboration for a Centre of Excellence focused on metal processing, automation, CNC cutting and welding solutions." },
      { name: "SIEMENS Ltd.", purpose: "Collaboration for a Centre of Excellence focused on industrial automation, digital manufacturing and smart technologies." },
      { name: "Stratasys India Pvt. Ltd", purpose: "Collaboration for a Centre of Excellence focused on 3D printing and additive manufacturing technologies." },
      { name: "Schunk Intec India Pvt. Ltd.", purpose: "Collaboration for a Centre of Excellence focused on automation, robotics and clamping technology." },
      { name: "IPG Photonics", purpose: "Collaboration for a Centre of Excellence focused on laser technologies and photonics, including advanced training and hands-on experience." },
      { name: "BOSCH Ltd", purpose: "Establishment of a Centre of Excellence providing advanced training, research opportunities and hands-on experience in automotive technologies." },
    ],
  },
  {
    category: "Associate Partners",
    items: [
      { name: "Windmöller & Hölscher", purpose: "Advanced training, research opportunities and hands-on experience in packaging technology and automation solutions." },
      { name: "Electropreneur Park", purpose: "Support for startups through mentorship, resources and access to technology, fostering innovation and entrepreneurial growth in electronics and technology." },
      { name: "Redcliffe Energy", purpose: "Support for industries in the energy sector through innovative energy solutions, expertise and resources." },
      { name: "Ghaziabad Precision Products", purpose: "Product and process development by combining available facilities and infrastructure." },
      { name: "Micromatic Grinding Technologies", purpose: "Collaboration to support industries with advanced grinding solutions and precision manufacturing technologies." },
      { name: "Octagon Precision", purpose: "Upgrade of the state-of-the-art Calibration & Technical Centre and establishment of an SPC lab facility in the Advanced Manufacturing Centre." },
      { name: "Rutag, IIT Delhi", purpose: "Identify technologies ongoing in villages or having potential to reach rural areas." },
      { name: "I-Hub Foundation (IHFC), IIT Delhi", purpose: "Research and development collaboration in Cobotics and support for future products in agriculture, defence, medical/healthcare and industries/MSMEs." },
      { name: "FIIT, IIT Delhi", purpose: "Promotion of startup ventures and enterprises in India and support for a vibrant social-enterprise ecosystem." },
      { name: "FANUC", purpose: "Collaboration to support industries with advanced automation and CNC solutions." },
      { name: "IMTMA", purpose: "Support for industries in manufacturing through industry insights, advanced technologies and resources." },
      { name: "Anderson Group", purpose: "Support for industries with advanced solutions in automation, engineering and process optimization." },
      { name: "Grind Master", purpose: "Support for industries with advanced solutions in surface finishing and manufacturing technologies." },
    ],
  },
  {
    category: "Academic Partners",
    items: [
      { name: "Steinbeis Academy for Advance Technical Training & Entrepreneurship", purpose: "Collaboration on advanced technical training and entrepreneurship." },
      { name: "Uttarakhand Technical University, Dehradun", purpose: "Academic research, skill development and innovation initiatives." },
      { name: "Bharti Vidyapeeth University COE", purpose: "Research, innovation and skill development initiatives providing advanced learning opportunities." },
      { name: "Bharti Vidyapeeth College of Engineering", purpose: "Upskilling of faculty and students in Automation, Robotics & Manufacturing." },
      { name: "Global Institute of Technology, Jaipur", purpose: "Academic research, skill development and innovation, enhancing learning and industry connections." },
      { name: "Universidad Autonoma de Chile", purpose: "Mutual collaboration including faculty and student exchange and student training." },
      { name: "Venkateshwara University, Gajraula", purpose: "Academic research, skill development and innovation initiatives." },
      { name: "Chittagong University of Engineering & Technology", purpose: "Support FABLAB operations and activities and facilitate faculty/student exchange." },
      { name: "Seth Jai Parkash Mukand Lal Institute of Engineering and Technology, Raduar", purpose: "Upskilling of faculty and students in Automation, Robotics & Manufacturing." },
      { name: "Panipat Institute of Technology, Panipat", purpose: "Upskilling of faculty and students in Automation, Robotics & Manufacturing." },
      { name: "FH West Coast University of Applied Sciences", purpose: "Exchange of educational methodology, scientific literature and didactic materials in Automation, Robotics & Manufacturing." },
      { name: "Siberian State Industrial University", purpose: "Exchange of educational methodology, scientific literature and didactic materials in areas of mutual interest." },
    ],
  },
];

/* =====================================================
   PROUD MOMENTS
   ===================================================== */

const proudMoments = [
  { number: "01", title: "Distinguished German Expert Visit", date: "24 October – 14 November 2025", text: "Prof. Wolf Burger, Senior Experten Service (SES), Germany, visited AKGEC for an expert engagement." },
  { number: "02", title: "AICTE Nodal Centre Initiative", date: "27 September 2025", text: "AKGEC hosted an AICTE–CBSE Design Thinking & Innovation workshop as an AICTE Nodal Centre." },
  { number: "03", title: "DGR Resettlement Training", date: "2025", text: "Training support was provided for defence personnel under the Directorate General Resettlement initiative." },
  { number: "04", title: "Eminent Industry & Institutional Engagement", date: "2025", text: "AKGEC Skills Foundation continued engagement with industry and institutional stakeholders through technical training and collaboration." },
  { number: "05", title: "NABL Accreditation", date: "2025", text: "The ZEISS Calibration & Testing Centre operates as an NABL-accredited facility for dimensional metrology and calibration services." },
  { number: "06", title: "Industry Skill Development", date: "2025", text: "ASF continued practical, industry-oriented skill development across automation, robotics, manufacturing, welding, metrology and related technologies." },
  { number: "07", title: "Robotics Training Excellence", date: "2025", text: "The KUKA Industrial Robotics Training Centre continued advanced robotics training and industry-oriented exposure." },
  { number: "08", title: "Advanced Welding Technology", date: "2025", text: "The Fronius Advance Welding Technology & Research Centre continued specialist training, research and development in welding technology." },
  { number: "09", title: "Industrial Automation Training", date: "2025", text: "ASF continued Siemens, Bosch Rexroth, Mitsubishi and integrated automation training through specialized laboratories." },
  { number: "10", title: "Drone Technology Training", date: "2025", text: "AKGEC Drone Academy continued DGCA-certified remote pilot training and drone technology programmes." },
  { number: "11", title: "Indian Railways Capacity Building", date: "2025", text: "ASF supported capacity-building and technical training initiatives associated with Indian Railways." },
  { number: "12", title: "Industry Competition & Technical Events", date: "2025", text: "ASF participated in and supported technical competitions and industry-focused events promoting practical skills." },
  { number: "13", title: "Academic–Industry Engagement", date: "2025", text: "The Foundation continued collaboration with academic institutions and industry partners for research, training and innovation." },
  { number: "14", title: "Innovation & Entrepreneurship", date: "2025", text: "ASF supported innovation, prototyping and entrepreneurship through its digital manufacturing and FabLab ecosystem." },
  { number: "15", title: "ISB Chandigarh Workshop", date: "2025", text: "A workshop engagement was conducted at ISB Chandigarh as part of professional and institutional capacity-building activities." },
  { number: "16", title: "Naveen Jindal Industry Engagement", date: "2025", text: "An industry engagement involving Naveen Jindal was among the documented institutional proud moments." },
];

/* =====================================================
   HERO IMAGE SLIDER
   ===================================================== */

const heroImages = [
  {
    src: "/images/hero/asf-main.jpg",
    alt: "AKGEC Skills Foundation technical training facility",
    position: "center 38%",
  },
  {
    src: "/images/hero/asf-robotics.jpg",
    alt: "Industrial robotics training at AKGEC Skills Foundation",
    position: "center 42%",
  },
  {
    src: "/images/hero/asf-training.jpg",
    alt: "Technical training at AKGEC Skills Foundation",
    position: "center 40%",
  },
  {
    src: "/images/hero/asf-fablab.jpg",
    alt: "FabLab and advanced technology training at AKGEC Skills Foundation",
    position: "center 42%",
  },
  {
    src: "/images/hero/asf-industry.jpg",
    alt: "Industry-oriented training at AKGEC Skills Foundation",
    position: "center 40%",
  },
];

/* =====================================================
   HERO SLIDER COMPONENT
   ===================================================== */

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((previous) => {
        return (previous + 1) % heroImages.length;
      });
    }, 4500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hero-slider">
      {heroImages.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className={`hero-slide ${
            index === current ? "active" : ""
          }`}
          style={{ objectPosition: image.position }}
        />
      ))}

      <div className="hero-slider-dots">
        {heroImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show hero image ${index + 1}`}
            aria-current={
              index === current ? "true" : undefined
            }
            className={
              index === current ? "active" : ""
            }
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   MAIN PAGE
   ===================================================== */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<(typeof centres)[number] | null>(null);
  const [selectedMou, setSelectedMou] = useState<(typeof mouGroups)[number]["items"][number] | null>(null);
  const [selectedProudMoment, setSelectedProudMoment] = useState<(typeof proudMoments)[number] | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationCourse, setRegistrationCourse] = useState<string | undefined>(undefined);

  function openRegistration(courseName?: string) {
    setRegistrationCourse(courseName);
    setRegistrationOpen(true);
  }

  /* ===================================================
     WHATSAPP URLS
     =================================================== */

  const adminUrl = whatsapp(
    ADMIN_WHATSAPP,
    "Hello AKGEC Skills Foundation, I would like to contact the admin."
  );

  return (
    <>
      {/* =================================================
          SKIP LINK
      ================================================= */}

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* =================================================
          TOP INFORMATION STRIP
      ================================================= */}

      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>
            AKGEC Skills Foundation
          </span>

          <div>
            <span>
              Supported by NSDC • Ministry of Skill Development and Entrepreneurship
            </span>

            <a href="#contact">
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="site-header">
        <div className="container header-inner">

          {/* LOGO + BRAND */}

          <a href="#" className="brand">

            <Image
              src="/logo/asf-logo.png"
              alt="AKGEC Skills Foundation"
              width={68}
              height={68}
              className="brand-logo"
            />

            <div className="brand-copy">

              <strong>
                AKGEC
              </strong>

              <span>
                SKILLS FOUNDATION
              </span>


            </div>

          </a>

          {/* NAVIGATION */}

          <nav
            className={
              menuOpen
                ? "main-nav mobile-open"
                : "main-nav"
            }
          >
            {navItems.map(([label, href]) => (
              <a
                href={href}
                key={label}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {label}
              </a>
            ))}
          </nav>

          {/* HEADER ACTIONS */}

          <div className="header-actions">

            <a
              href={adminUrl}
              className="admin-link"
            >
              Contact Admin
            </a>

            <button
  type="button"
  className="register-link"
  onClick={() => openRegistration()}
>
  Register
  <ArrowUpRight size={17} />
</button>

          </div>

          {/* MOBILE MENU */}

          <button
            className="mobile-menu"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label={
              menuOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main id="main-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          {/* AUTOMATIC IMAGE SLIDER */}

          <HeroSlider />

          {/* HERO DARK OVERLAY */}

          <div className="hero-overlay" />

          {/* HERO CONTENT */}

          <div className="container hero-content">

            <span className="hero-kicker">
              AKGEC SKILLS FOUNDATION
            </span>

            <h1>
              Industry-oriented
              <br />
              skill development for
              <br />
              <em>future-ready careers.</em>
            </h1>

            <p>
              AKGEC Skills Foundation promotes industry-oriented skills through practical training, advanced technology and industry–institution collaboration.
            </p>

            <div className="hero-actions">

              <a
                href="#training"
                className="primary-action"
              >
                Explore Training
                <ArrowRight size={18} />
              </a>

              <button
  type="button"
  className="secondary-action"
  onClick={() => openRegistration()}
>
  Register
  <ArrowUpRight size={18} />
</button>

            </div>

          </div>

          {/* HERO FOOTER */}

          <div className="hero-footer-line">

            <div className="container">

              <span>
                SKILLS
              </span>

              <span>
                TECHNOLOGY
              </span>

              <span>
                INDUSTRY
              </span>

              <span>
                EMPLOYABILITY
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            AT A GLANCE
        ================================================= */}

        <section className="glance">

          <div className="container">

            <div className="section-heading compact">

              <span>
                AT A GLANCE
              </span>

              <h2>
                Built around practical capability.
              </h2>

            </div>

            <div className="glance-grid">

              <div>
                <strong>2015</strong>
                <span>Foundation incorporated</span>
              </div>

              <div>
                <strong>ISO</strong>
                <span>ISO 9001 certified organization</span>
              </div>

              <div>
                <strong>14</strong>
                <span>Centres / initiatives listed under the ASF umbrella</span>
              </div>

              <div>
                <strong>70%</strong>
                <span>Learning through practicals, as highlighted in the brochure</span>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            ABOUT
        ================================================= */}

        <section
          id="about"
          className="about"
        >

          <div className="container about-grid">

            <div>

              <span className="section-label">
                ABOUT THE FOUNDATION
              </span>

              <h2>
                Industry-oriented skills
                <em>
                  {" "}
                  for employability.
                </em>
              </h2>

            </div>

            <div className="about-copy">

              <p className="lead">
                AKGEC Skills Foundation (ASF) is an initiative of AKGEC supported by the National Skill Development Corporation (NSDC), Ministry of Skill Development and Entrepreneurship, Government of India, to promote industry-oriented skills among young students and professionals and make them employable.
              </p>

              <p>
                ASF offers skill-development training through industry–institution collaboration, aligned with National Occupational Standards (NOS) and Qualification Packs (QP). Its facilities support training, prototyping, testing and measurement in Automation, Robotics and Manufacturing.
              </p>

              <div className="about-points">

                <div>
                  <ShieldCheck size={21} />
                  Courses aligned with NOS and QP
                </div>

                <div>
                  <ShieldCheck size={21} />
                  Industry–institution collaboration
                </div>

                <div>
                  <ShieldCheck size={21} />
                  Training, prototyping, testing and measurement
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            TRAINING
        ================================================= */}

        <section
          id="training"
          className="training"
        >

          <div className="container">

            <div className="section-heading">

              <span>
                TRAINING & PROGRAMMES
              </span>

              <h2>
                Learn through
                <br />
                <em>practical exposure.</em>
              </h2>

              <p>
                ASF provides skill-development training supported by industry partners, practical facilities and nationally and internationally recognized certification ecosystems.
              </p>

            </div>

            <div className="training-grid">

              {trainingPrograms.map((item) => {

                const Icon = item.icon;

                return (
                  <article
                    className="training-card"
                    key={item.title}
                  >

                    <div className="training-top">

                      <Icon size={42} />

                      <span>
                        {item.number}
                      </span>

                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.text}
                    </p>

                    <button
  type="button"
  className="training-enquire"
  onClick={() => openRegistration(item.title)}
>
  Register
  <ArrowUpRight size={17} />
</button>

                  </article>
                );
              })}

            </div>

          </div>

        </section>

        {/* =================================================
            CENTRES OF EXCELLENCE
        ================================================= */}

        <section
          id="centres"
          className="centres"
        >

          <div className="container">

            <div className="centres-header">

              <div>

                <span className="section-label">
                  CENTRES OF EXCELLENCE
                </span>

                <h2>
                  Advanced technology.
                  <br />
                  <em>
                    Practical exposure.
                  </em>
                </h2>

              </div>

              <p>
                The ASF brochure lists Centres of Excellence and specialized academies covering robotics, welding, automation, manufacturing, metrology, pneumatics, digital manufacturing and drone technology.
              </p>

            </div>

            <div className="centres-layout">

              <div className="centres-image">

                <Image
                  src="/images/centres/kuka.jpg"
                  alt="KUKA robotics training centre"
                  fill
                  sizes="50vw"
                  className="cover-image"
                />

                <div className="image-caption">
                  Centres & specialised training facilities
                </div>

              </div>

              <div className="centres-list">

                {centres.map((centre, index) => (
                  <button
                    type="button"
                    className="centre-select"
                    key={centre.name}
                    onClick={() => setSelectedCentre(centre)}
                  >
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{centre.name}</strong>
                    <ChevronRight size={21} />
                  </button>
                ))}

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            INDUSTRY
        ================================================= */}

        <section
          id="industry"
          className="industry"
        >

          <div className="industry-image">

            <Image
              src="/images/industry/industrial-services.jpg"
              alt="Industrial technology and services"
              fill
              sizes="50vw"
              className="cover-image"
            />

          </div>

          <div className="industry-content">

            <span className="section-label">
              INDUSTRY ENGAGEMENT
            </span>

            <h2>
              Skills that respond
              <br />
              to{" "}
              <em>
                industry needs.
              </em>
            </h2>

            <p>
              ASF provides state-of-the-art training, prototyping, testing and measurement facilities with active industry support to meet the growing requirement for highly skilled manpower.
            </p>

            <div className="industry-list">

              <span>Industrial Robotics</span>
              <span>Product Design</span>
              <span>Testing, Calibration & Metrology</span>
              <span>Integrated Automation</span>
              <span>Instrumentation & Automation</span>
              <span>Welding, Thermal Cutting & NDT</span>
              <span>Digital Manufacturing</span>
              <span>Advanced Manufacturing</span>
              <span>Factory Automation</span>
              <span>Drone Technology</span>

            </div>

            <a
              href={adminUrl}
              className="dark-action"
            >
              Contact Admin on WhatsApp
              <MessageCircle size={18} />
            </a>

          </div>

        </section>


        {/* =================================================
            MOUs & PARTNERSHIPS
        ================================================= */}

        <section id="mous" className="mous-section">
          <div className="container">
            <div className="section-heading">
              <span>MoUs & PARTNERSHIPS</span>
              <h2>Building bridges with <em>industry & academia.</em></h2>
              <p>
                Strategic collaborations supporting Centres of Excellence, skill development,
                research, innovation, entrepreneurship and industry-academia engagement.
              </p>
            </div>

            <div className="mou-category-grid">
              {mouGroups.map((group) => (
                <div className="mou-category" key={group.category}>
                  <div className="mou-category-head">
                    <span>{String(group.items.length).padStart(2, "0")}</span>
                    <div>
                      <small>PARTNERSHIPS</small>
                      <h3>{group.category}</h3>
                    </div>
                  </div>

                  <div className="mou-list">
                    {group.items.map((item, index) => (
                      <button
                        type="button"
                        className="mou-item"
                        key={item.name}
                        onClick={() => setSelectedMou(item)}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{item.name}</strong>
                        <ChevronRight size={21} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            PROUD MOMENTS
        ================================================= */}

        <section id="proud-moments" className="proud-section">
          <div className="container">
            <div className="section-heading">
              <span>PROUD MOMENTS</span>
              <h2>Milestones that reflect <em>our journey.</em></h2>
              <p>
                Selected institutional achievements, engagements and documented milestones
                from the supplied ASF material.
              </p>
            </div>

            <div className="proud-grid">
              {proudMoments.map((moment) => (
                <button
                  type="button"
                  className="proud-card"
                  key={moment.number}
                  onClick={() => setSelectedProudMoment(moment)}
                >
                  <span className="proud-number">{moment.number}</span>
                  <span className="proud-date">{moment.date}</span>
                  <strong>{moment.title}</strong>
                  <p>{moment.text}</p>
                  <span className="proud-more">
                    View details <ArrowUpRight size={17} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            CAREER
        ================================================= */}

        <section
          id="placements"
          className="career"
        >

          <div className="container">

            <div className="career-header">

              <span className="section-label">
                CAREER & EMPLOYABILITY
              </span>

              <h2>
                Skills that lead to
                <br />
                <em>
                  opportunity.
                </em>
              </h2>

            </div>

            <div className="career-grid">

              <div>

                <Users size={32} />

                <strong>
                  Industry Exposure
                </strong>

                <p>
                  Practical learning environments with industry machinery and technology.
                </p>

              </div>

              <div>

                <GraduationCap size={32} />

                <strong>
                  Skill Development
                </strong>

                <p>
                  Job-oriented training and skill development focused on employability.
                </p>

              </div>

              <div>

                <Building2 size={32} />

                <strong>
                  Industry Connect
                </strong>

                <p>
                  Collaboration with industry sponsors, professional bodies and government research agencies.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            NEWS & EVENTS
        ================================================= */}

        <section
          id="facilities"
          className="news"
        >

          <div className="container">

            <div className="section-heading">

              <span>ASF CAMPUS & FACILITIES</span>

              <h2>
                Infrastructure for
                <br />
                <em>learning and collaboration.</em>
              </h2>

              <p>
                ASF is conceived to support interaction between academia, industry and start-ups through training infrastructure and campus facilities.
              </p>

            </div>

            <div className="news-grid">

              <article className="news-card news-text-card">
                <div className="news-content">
                  <span>RESIDENTIAL FACILITIES</span>
                  <h3>On-campus accommodation</h3>
                  <p>
                    The brochure states that ASF provides residential accommodation, with separate hostels for girls and boys, Wi-Fi-enabled rooms, modern amenities, dining facilities and round-the-clock security.
                  </p>
                </div>
              </article>

              <article className="news-card news-text-card">
                <div className="news-content">
                  <span>SEMINAR HALL</span>
                  <h3>250-seat learning & conference facility</h3>
                  <p>
                    The campus has an air-conditioned seminar hall with 250 seating capacity and audio-visual conferencing equipment for lectures, seminars and conferences.
                  </p>
                </div>
              </article>

              <article className="news-card news-text-card">
                <div className="news-content">
                  <span>SPORTS & WELLBEING</span>
                  <h3>Gymnasium and sports facilities</h3>
                  <p>
                    The brochure lists gymnasium together with indoor and outdoor sports facilities for trainees and hostel inmates.
                  </p>
                </div>
              </article>

            </div>
          </div>

        </section>

        <section
          id="contact"
          className="contact"
        >

          <div className="container contact-grid">

            <div>

              <span className="contact-label">
                GET IN TOUCH
              </span>

              <h2>
                Need information?
                <br />
                <em>
                  We are here to help.
                </em>
              </h2>

            </div>

            <div className="contact-details">

              <div className="contact-row">

                <MapPin size={25} />

                <p>
                  AKGEC Skills Foundation
                  <br />
                  27th Km Stone, Delhi-Hapur Bypass Road
                  <br />
                  P.O. Adhyatmik Nagar, Ghaziabad – 201009
                  <br />
                  Uttar Pradesh, India
                </p>

              </div>

              <div className="contact-row">

                <Phone size={25} />

                <div>
                  <a href="tel:+919910249199">+91 9910249199</a>
                  <br />
                  <a href="tel:+918743879879">+91 8743879879</a>
                  <br />
                  <a href="tel:180030006484">1800-3000-6484 (Toll Free)</a>
                </div>

              </div>

              <div className="contact-row">

                <Mail size={25} />

                <a href="mailto:support@skills.akgec.ac.in">
                  support@skills.akgec.ac.in
                </a>

              </div>

              <div className="contact-actions">

                <button
  type="button"
  className="contact-primary"
  onClick={() => openRegistration()}
>
  Start Registration
  <ArrowRight size={19} />
</button>

                <a
                  href={adminUrl}
                  className="contact-secondary"
                >
                  Contact Admin
                  <MessageCircle size={19} />
                </a>

              </div>

            </div>

          </div>

        </section>

      </main>


      {selectedMou && (
        <div
          className="detail-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedMou(null)}
        >
          <div
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="centre-modal-close"
              onClick={() => setSelectedMou(null)}
              aria-label="Close MoU details"
            >
              <X size={24} />
            </button>
            <span className="section-label">MEMORANDUM OF UNDERSTANDING</span>
            <h2>{selectedMou.name}</h2>
            <div className="detail-modal-line" />
            <h3>Purpose & Collaboration</h3>
            <p>{selectedMou.purpose}</p>
            <div className="centre-modal-actions">
              <a href={adminUrl} className="contact-secondary">
                Contact Admin <MessageCircle size={19} />
              </a>
              <button type="button" className="modal-close-text" onClick={() => setSelectedMou(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProudMoment && (
        <div
          className="detail-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedProudMoment(null)}
        >
          <div
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="centre-modal-close"
              onClick={() => setSelectedProudMoment(null)}
              aria-label="Close proud moment details"
            >
              <X size={24} />
            </button>
            <span className="section-label">PROUD MOMENT</span>
            <span className="detail-date">{selectedProudMoment.date}</span>
            <h2>{selectedProudMoment.title}</h2>
            <div className="detail-modal-line" />
            <p>{selectedProudMoment.text}</p>
            <div className="centre-modal-actions">
              <a href={adminUrl} className="contact-secondary">
                Contact Admin <MessageCircle size={19} />
              </a>
              <button type="button" className="modal-close-text" onClick={() => setSelectedProudMoment(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCentre && (
        <div
          className="centre-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedCentre(null)}
        >
          <div
            className="centre-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="centre-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="centre-modal-close"
              onClick={() => setSelectedCentre(null)}
              aria-label="Close centre details"
            >
              <X size={22} />
            </button>

            <span className="section-label">CENTRE OF EXCELLENCE</span>
            <h2 id="centre-modal-title">{selectedCentre.name}</h2>

            <div className="centre-modal-meta">
              <span>{selectedCentre.focus}</span>
              <span>{selectedCentre.partner}</span>
            </div>

            <p>{selectedCentre.description}</p>

            <div className="centre-modal-section">
              <h3>Training programmes</h3>
              <ul>
                {selectedCentre.programs.map((program) => (
                  <li key={program}>{program}</li>
                ))}
              </ul>
            </div>

            <div className="centre-modal-section centre-modal-note">
              <h3>Brochure information</h3>
              <p>{selectedCentre.recognition}</p>
            </div>

            <div className="centre-modal-actions">
              <a
                href={adminUrl}
                className="contact-secondary"
              >
                Ask Admin on WhatsApp
                <MessageCircle size={19} />
              </a>
              <button
                type="button"
                className="modal-close-text"
                onClick={() => setSelectedCentre(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <RegistrationModal
        isOpen={registrationOpen}
        initialCourseName={registrationCourse}
        onClose={() => setRegistrationOpen(false)}
      />

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="container">

          <div className="footer-main">

            {/* FOOTER BRAND */}

            <div className="footer-identity">

              <Image
                src="/logo/asf-logo.png"
                alt="AKGEC Skills Foundation"
                width={68}
                height={68}
              />

              <h3>
                AKGEC Skills Foundation
              </h3>

              <p>
                An initiative of AKGEC supported by NSDC, Ministry of Skill Development and Entrepreneurship, Government of India, focused on industry-oriented skills and employability.
              </p>

            </div>

            {/* FOUNDATION */}

            <div className="footer-column">

              <h4>
                FOUNDATION
              </h4>

              <a href="#about">
                About the Foundation
              </a>

              <a href="#training">
                Training & Programmes
              </a>

              <a href="#centres">
                Centres of Excellence
              </a>

              <a href="#industry">
                Industry Engagement
              </a>
              <a href="#mous">
                MoUs & Partnerships
              </a>
              <a href="#proud-moments">
                Proud Moments
              </a>

            </div>

            {/* INFORMATION */}

            <div className="footer-column">

              <h4>
                INFORMATION
              </h4>

              <a href="#placements">
                Career & Employability
              </a>

              <a href="#facilities">
                Facilities
              </a>

              <a href="#contact">
                Contact Information
              </a>

              <button
  type="button"
  className="footer-registration-button"
  onClick={() => openRegistration()}
>
  Registration
</button>

            </div>

            {/* SOCIAL */}

            <div className="footer-column">

              <h4>CONNECT WITH ASF</h4>

              <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>

              <a href={adminUrl}>
                WhatsApp Admin
              </a>

              <a href="https://www.akgecskills.in/" target="_blank" rel="noopener noreferrer">
                Official Website
              </a>

            </div>

          </div>

          {/* FOOTER BOTTOM */}

          <div className="footer-bottom">

            <p>
              © 2026 AKGEC Skills Foundation. All Rights Reserved. | CIN U74120UP2015NPL069636
            </p>

            <div className="footer-social">
              <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>
              <a href={adminUrl} aria-label="Contact ASF Admin on WhatsApp"><MessageCircle size={20} /></a>
            </div>

          </div>

        </div>

      </footer>

      {/* =================================================
          FLOATING ADMIN WHATSAPP
      ================================================= */}

      <a
        href={adminUrl}
        className="floating-whatsapp"
        aria-label="Contact ASF Admin on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>

    </>
  );
}

