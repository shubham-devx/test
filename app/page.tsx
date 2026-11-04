"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Bot,
  Cog,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  Cpu,
  DraftingCompass,
  Flame,
  Factory,
  Gauge,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Plane,
  Menu,
  MessageCircle,
  ShieldCheck,
  ScanLine,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import defaultSiteContent from "@/data/site-content.json";
import type { SiteContent, SiteSection } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";
import { SITE_THEMES } from "@/lib/siteThemes";
import RegistrationModal from "../components/RegistrationModal";
import AnnouncementBanner from "../components/AnnouncementBanner";
import CourseFeesModal from "../components/CourseFeesModal";

/* =====================================================
   WHATSAPP
   ===================================================== */
const ADMIN_WHATSAPP = "917518681245";

/* =====================================================
   SOCIAL LINKS
   Replace placeholder links later with official ASF URLs
   ===================================================== */

const SOCIAL = {
  instagram:
    "https://www.instagram.com/akgecskillsfoundation/",
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
  // ["MoUs", "#mous"],
  // ["Proud Moments", "#proud-moments"],
  // ["Careers", "#placements"],
  // ["Facilities", "#facilities"],
];

/* =====================================================
   TRAINING PROGRAMMES
   ===================================================== */

const trainingIcons = {
  robotics: Bot,
  labview: Gauge,
  bosch: Cog,
  automation: Cpu,
  welding: Flame,
  manufacturing: Factory,
  "bosch-jcc": BadgeCheck,
  siemens: Boxes,
  fablab: ScanLine,
  cfc: DraftingCompass,
  drone: Plane,
};

const trainingCategoryIcons: Record<Exclude<TrainingCategory, "All Programmes">, typeof Bot> = {
  Robotics: Bot,
  "Industrial Automation": Cog,
  Manufacturing: Factory,
  Welding: Flame,
  "Drone Technology": Plane,
  "Software & Technology": ScanLine,
};

const trainingCategories = [
  "All Programmes",
  "Robotics",
  "Industrial Automation",
  "Manufacturing",
  "Welding",
  "Drone Technology",
  "Software & Technology",
] as const;

type TrainingCategory = (typeof trainingCategories)[number];

function getTrainingCategory(icon: string, title: string): Exclude<TrainingCategory, "All Programmes"> {
  const searchText = `${icon} ${title}`.toLowerCase();
  if (searchText.includes("drone")) return "Drone Technology";
  if (icon === "robotics" || /kuka|robotic/.test(searchText)) return "Robotics";
  if (icon === "welding" || searchText.includes("fronius")) return "Welding";
  if (icon === "manufacturing" || icon === "cfc") return "Manufacturing";
  if (searchText.includes("plm") || icon === "labview" || icon === "fablab") return "Software & Technology";
  if (icon === "automation" || icon === "bosch" || icon === "bosch-jcc" || icon === "siemens") {
    return "Industrial Automation";
  }
  return "Software & Technology";
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = document.querySelector(".glance-grid");
    if (!element) return;

    let frame = 0;
    let visibilityFrame = 0;
    let started = false;
    const checkVisibility = () => {
      if (started) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.top > window.innerHeight * 0.85 || bounds.bottom < 0) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setValue(target);
        return;
      }
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / 900, 1);
        setValue(Math.round(target * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = window.requestAnimationFrame(animate);
      };
      frame = window.requestAnimationFrame(animate);
    };
    const scheduleVisibilityCheck = () => {
      window.cancelAnimationFrame(visibilityFrame);
      visibilityFrame = window.requestAnimationFrame(checkVisibility);
    };

    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck);
    scheduleVisibilityCheck();
    return () => {
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(visibilityFrame);
    };
  }, [target]);

  return <span aria-label={`${target}${suffix}`}>{value.toLocaleString("en-IN")}{suffix}</span>;
}

function createFallbackSiteContent(): SiteContent {
  return {
    ...(defaultSiteContent as SiteContent),
    navigation: navItems.map(([label, href]) => ({ label, section: href.slice(1) as SiteSection })),
    trainingPrograms: defaultSiteContent.trainingPrograms as SiteContent["trainingPrograms"],
    industryFocusAreas: defaultSiteContent.industryFocusAreas as SiteContent["industryFocusAreas"],
    centresList: centres.map((centre) => ({
      name: centre.name,
      partner: centre.partner,
      focus: centre.focus,
      description: centre.description,
      itemsTitle: "facilities" in centre ? "Facilities" : "Training programmes",
      items: centre.programs ?? ("facilities" in centre ? centre.facilities : []) ?? [],
      recognition: centre.recognition,
    })),
  };
}

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
  {
  name: "CFC",
  fullName: "Common Facility Center",
  partner: "AKG Foundation for Innovation and Product Development",
  focus: "General Engineering, Product Development, and Industry 4.0",
  description:
    "A Common Facility Center proposed at AKGEC, Ghaziabad, under the Uttar Pradesh government's One District, One Product (ODOP) scheme. The center aims to support local general engineering industries through advanced manufacturing facilities, material testing, research, and product development.",
  facilities: [
    "Modern Tool Room",
    "Material Testing Laboratory",
    "Research and Development Laboratory",
    "Industry 4.0 Laboratory",
    "High-End Engineering Product Development"
  ],
  recognition:
    "Established as an initiative to support Ghaziabad's general engineering industry and promote industry–academia collaboration."
} ,
];


/* =====================================================
   MoUs & PARTNERSHIPS
   ===================================================== */

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Retained for the commented-out MoUs section.
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Retained for the commented-out milestones section.
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
    src: "/images/hero/asf-robotics.JPG",
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
];

/* =====================================================
   HERO SLIDER COMPONENT
   ===================================================== */

function HeroSlider({ heroImage }: { heroImage: string }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = [heroImages[1], { ...heroImages[0], src: heroImage }, ...heroImages.slice(2)];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(() => {
      setCurrent((previous) => {
        return (previous + 1) % heroImages.length;
      });
    }, 4500);

    return () => {
      clearInterval(interval);
    };
  }, [paused]);

  return (
    <div
      className="hero-slider"
      role="group"
      aria-label="AKGEC Skills Foundation highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          unoptimized={shouldBypassImageOptimization(image.src)}
          className={`hero-slide ${
            index === current ? "active" : ""
          }`}
          style={{ objectPosition: image.position }}
        />
      ))}

      <div className="hero-slider-dots">
        {slides.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show Foundation highlight ${index + 1}: ${image.alt}`}
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
  const [siteContent, setSiteContent] = useState<SiteContent>(() => createFallbackSiteContent());
  const [selectedCentre, setSelectedCentre] = useState<SiteContent["centresList"][number] | null>(null);
  const [selectedMou, setSelectedMou] = useState<(typeof mouGroups)[number]["items"][number] | null>(null);
  const [selectedProudMoment, setSelectedProudMoment] = useState<(typeof proudMoments)[number] | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationCourse, setRegistrationCourse] = useState<string | undefined>(undefined);
	const [courseFeesOpen, setCourseFeesOpen] = useState(false);
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [trainingCategory, setTrainingCategory] = useState<TrainingCategory>("All Programmes");
  const [expandedCentreName, setExpandedCentreName] = useState<string | null>(null);

  useEffect(() => {
    const palette = SITE_THEMES[siteContent.theme];
    const root = document.documentElement;
    root.style.setProperty("--maroon", palette.primary);
    root.style.setProperty("--maroon-dark", palette.dark);
    root.style.setProperty("--maroon-light", palette.light);
    root.style.setProperty("--saffron", palette.accent);
    root.style.setProperty("--brand-rgb", palette.rgb);
  }, [siteContent.theme]);

  useEffect(() => {
    fetch("/api/site-content", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<SiteContent> : null)
      .then((content) => { if (content) setSiteContent(content); })
      .catch(() => undefined);
  }, []);

  function openRegistration(courseName?: string) {
    setRegistrationCourse(courseName);
    setRegistrationOpen(true);
  }

  function toggleSection(section: string) {
    setExpandedSections((previous) => ({ ...previous, [section]: !previous[section] }));
  }

  /* ===================================================
     WHATSAPP URLS
     =================================================== */

  const adminUrl = whatsapp(
    ADMIN_WHATSAPP,
    "Hello AKGEC Skills Foundation, I would like to contact the admin."
  );
  const droneAcademy = siteContent.centresList.find((centre) => /drone/i.test(`${centre.name} ${centre.focus}`));
  const hasDroneProgramme = siteContent.trainingPrograms.some((program) => /drone/i.test(`${program.icon} ${program.title} ${program.text}`));
  const programmeCards = [
    ...siteContent.trainingPrograms.map((item) => {
      const category = getTrainingCategory(item.icon, item.title);
      return { ...item, category };
    }),
    ...(droneAcademy && !hasDroneProgramme ? [{
      icon: "drone",
      title: droneAcademy.name,
      text: droneAcademy.description,
      category: "Drone Technology" as const,
      image: undefined,
    }] : []),
  ];
  const filteredPrograms = trainingCategory === "All Programmes"
    ? programmeCards
    : programmeCards.filter((program) => program.category === trainingCategory);
  const visiblePrograms = trainingCategory === "All Programmes" && !expandedSections.training
    ? filteredPrograms.slice(0, 4)
    : filteredPrograms;

  return (
    <div className="foundation-home">
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
              width={98}
              height={98}
              className="brand-logo"
            />

            <div className="brand-copy">

              <strong>
                AKGEC SKILLS FOUNDATION
              </strong>

              {/* <span>
                SKILLS FOUNDATION
              </span> */}


            </div>

          </a>

          {/* NAVIGATION */}

          <nav
            id="foundation-navigation"
            className={
              menuOpen
                ? "main-nav mobile-open"
                : "main-nav"
            }
          >
            {siteContent.navigation.map(({ label, section }) => (
              <a
                href={`#${section}`}
                key={label}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {label}
              </a>
            ))}
            <a href="/asf-tbi" className="tbi-nav-entry" onClick={() => setMenuOpen(false)}>
              ASF-TBI <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </nav>

          {/* HEADER ACTIONS */}

          <div className="header-actions">
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
            type="button"
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
            aria-controls="foundation-navigation"
          >
            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

        </div>
      </header>

      <AnnouncementBanner />

      {/* =================================================
          MAIN
      ================================================= */}

      <main id="main-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          {/* AUTOMATIC IMAGE SLIDER */}

          <HeroSlider heroImage={siteContent.images.hero} />

          {/* HERO DARK OVERLAY */}

          <div className="hero-overlay" />

          {/* HERO CONTENT */}

          <div className="container hero-content">

            <span className="hero-kicker">
              {/* AKGEC SKILLS FOUNDATION */}
            </span>

            <h1>
              Industry-oriented
              <br />
              skill development for
              <br />
              <em>future-ready careers</em>
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
                Built around practical capability
              </h2>

            </div>

            <div className="glance-grid">

              <article className="glance-card">
                <CalendarDays size={20} aria-hidden="true" />
                <strong><CountUp target={2015} /></strong>
                <span>Foundation incorporated</span>
              </article>

              <article className="glance-card">
                <BadgeCheck size={20} aria-hidden="true" />
                <strong>ISO</strong>
                <span>ISO 9001 certified organization</span>
              </article>

              <article className="glance-card">
                <Boxes size={20} aria-hidden="true" />
                <strong><CountUp target={15} /></strong>
                <span>Centres and initiatives listed under ASF</span>
              </article>

              <article className="glance-card">
                <Gauge size={20} aria-hidden="true" />
                <strong><CountUp target={70} suffix="%" /></strong>
                <span>Practical learning, as highlighted in the brochure</span>
              </article>

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

            <div className="about-image">
              <Image
                src={siteContent.images.about}
                alt="Learners gaining hands-on technical experience at AKGEC Skills Foundation"
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1024px) 80vw, 45vw"
                className="cover-image"
                unoptimized={shouldBypassImageOptimization(siteContent.images.about)}
              />
              <span className="about-image-caption">Hands-on learning, built for industry</span>
            </div>

            <div className="about-content">
              <div>
                <span className="section-label">{siteContent.about.label}</span>
                <h2>{siteContent.about.heading}</h2>
              </div>

              <div className="about-copy">
                <p className="lead">{siteContent.about.lead}</p>
                <p>{siteContent.about.description}</p>

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
                <a className="about-learn-more" href="#industry">
                  Learn more about ASF <ArrowRight size={17} aria-hidden="true" />
                </a>
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

              <span>{siteContent.training.label}</span>
              <h2>{siteContent.training.heading}</h2>
              <p>{siteContent.training.description}</p>

              <button type="button" className="course-fees-trigger" onClick={() => setCourseFeesOpen(true)}>
                Courses & Fees
                <ArrowUpRight size={17} />
              </button>

            </div>

            <div className="training-filters" role="group" aria-label="Filter training programmes by category">
              {trainingCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={trainingCategory === category ? "active" : ""}
                  aria-pressed={trainingCategory === category}
                  onClick={() => {
                    setTrainingCategory(category);
                    setExpandedSections((previous) => ({ ...previous, training: false }));
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <p className="training-result-count" aria-live="polite">
              Showing {visiblePrograms.length}{visiblePrograms.length !== filteredPrograms.length ? ` of ${filteredPrograms.length}` : ""} {filteredPrograms.length === 1 ? "programme" : "programmes"}
            </p>

            <div className="training-grid">
              {visiblePrograms.map((item) => {
                const Icon = trainingIcons[item.icon as keyof typeof trainingIcons] ?? trainingCategoryIcons[item.category];

                return (
                  <article className="training-card" key={item.title}>
                    <div className="training-card-media">
                      <span className="training-card-mark" aria-hidden="true">
                        <Icon size={24} strokeWidth={1.8} />
                      </span>
                      <span className="training-category-label">{item.category}</span>
                    </div>

                    <div className="training-card-body">
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <button
                        type="button"
                        className="training-enquire"
                        onClick={() => openRegistration(item.title)}
                      >
                        Register <ArrowUpRight size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredPrograms.length === 0 && (
              <p className="training-empty">No programmes are listed in this category yet.</p>
            )}
            {trainingCategory === "All Programmes" && filteredPrograms.length > 4 && (
              <button
                type="button"
                className="view-more-button"
                onClick={() => toggleSection("training")}
                aria-expanded={Boolean(expandedSections.training)}
              >
                {expandedSections.training ? "View fewer programmes" : "View more programmes"}
                {expandedSections.training ? <ChevronDown size={17} /> : <ArrowUpRight size={17} />}
              </button>
            )}
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
                  {siteContent.centres.label}
                </span>

                <h2>{siteContent.centres.heading}</h2>

              </div>

              <p>
                {siteContent.centres.description}
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

              </div>

              <div className="centres-list">

                {siteContent.centresList.slice(0, expandedSections.centres ? undefined : 5).map((centre, index) => {
                  const isExpanded = expandedCentreName === centre.name;
                  return (
                    <div className="centre-list-item" key={centre.name}>
                      <button
                        type="button"
                        className="centre-select"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedCentreName(isExpanded ? null : centre.name)}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{centre.name}</strong>
                        <ChevronRight size={21} aria-hidden="true" />
                      </button>
                      {isExpanded && (
                        <div className="centre-summary">
                          <p>{centre.description}</p>
                          <button type="button" onClick={() => setSelectedCentre(centre)}>
                            View centre details <ArrowUpRight size={15} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {siteContent.centresList.length > 5 && (
                  <button
                    type="button"
                    className="view-more-button"
                    onClick={() => toggleSection("centres")}
                    aria-expanded={Boolean(expandedSections.centres)}
                  >
                    {expandedSections.centres ? "Show fewer centres" : `View all ${siteContent.centresList.length} centres`}
                    {expandedSections.centres ? <ChevronDown size={17} /> : <ArrowUpRight size={17} />}
                  </button>
                )}

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
              src={siteContent.images.industry}
              alt="Industrial technology and services"
              fill
              sizes="50vw"
              className="cover-image"
              unoptimized={shouldBypassImageOptimization(siteContent.images.industry)}
            />

          </div>

          <div className="industry-content">

            <span className="section-label">
              {siteContent.industry.label}
            </span>

            <h2>{siteContent.industry.heading}</h2>
            <p>{siteContent.industry.description}</p>

            <div className="industry-list">
              {siteContent.industryFocusAreas.map((area) => {
                const Icon = area.icon === "aerospace" ? Plane : area.icon === "healthcare" ? HeartPulse : Factory;
                return (
                  <details className="industry-area-card" key={area.name}>
                    <summary>
                      <span className={`industry-area-icon ${area.icon}`} aria-hidden="true"><Icon size={21} strokeWidth={2} /></span>
                      <strong>{area.name}</strong>
                      <ChevronDown className="industry-area-chevron" size={18} aria-hidden="true" />
                    </summary>
                    <p>{area.details}</p>
                  </details>
                );
              })}
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
        {/*

        <section id="mous" className="mous-section">
          <div className="container">
            <div className="section-heading">
              <span>MoUs & PARTNERSHIPS</span>
              <h2>Building bridges with <em>industry & academia</em></h2>
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
                    {group.items.slice(0, expandedSections[`mou-${group.category}`] ? undefined : 3).map((item, index) => (
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

                    {group.items.length > 3 && (
                      <button
                        type="button"
                        className="view-more-button"
                        onClick={() => toggleSection(`mou-${group.category}`)}
                      >
                        {expandedSections[`mou-${group.category}`] ? "Show less" : "View more partnerships"}
                        <ArrowUpRight size={17} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            PROUD MOMENTS
        ================================================= */}
 {/*
        <section id="proud-moments" className="proud-section">
          <div className="container">
            <div className="section-heading">
              <span>PROUD MOMENTS</span>
              <h2>Milestones that reflect <em>our journey</em></h2>
              <p>
                Selected institutional achievements, engagements and documented milestones
                from the supplied ASF material.
              </p>
            </div>

            <div className="proud-grid">
              {proudMoments.slice(0, expandedSections.proud ? undefined : 3).map((moment) => (
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

            {proudMoments.length > 3 && (
              <button type="button" className="view-more-button" onClick={() => toggleSection("proud")}>
                {expandedSections.proud ? "Show less" : "View more milestones"}
                <ArrowUpRight size={17} />
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            CAREER
        ================================================= */}
{/*
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
*/}

        {/* =================================================
            NEWS & EVENTS
        ================================================= */}
{/*
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
                <em>learning and collaboration</em>
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

        */}
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
                  We are here to help
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

            <span className="section-label">CENTRE OF EXCELLENCE(COE)</span>
            <h2 id="centre-modal-title">{selectedCentre.name}</h2>

            <div className="centre-modal-meta">
              <span>{selectedCentre.focus}</span>
              <span>{selectedCentre.partner}</span>
            </div>

            <p>{selectedCentre.description}</p>

            <div className="centre-modal-section">
              <h3>{selectedCentre.itemsTitle}</h3>
              <ul>
                {selectedCentre.items.map((item) => (
                  <li key={item}>{item}</li>
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

      {registrationOpen && (
        <RegistrationModal
          isOpen
          initialCourseName={registrationCourse}
          onClose={() => setRegistrationOpen(false)}
        />
      )}

      <CourseFeesModal
        isOpen={courseFeesOpen}
        onClose={() => setCourseFeesOpen(false)}
        onRegister={(courseName) => {
          setCourseFeesOpen(false);
          openRegistration(courseName);
        }}
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
                Centres of Excellence(COE)
              </a>

              <a href="#industry">
                Industry Engagement
              </a>
              <a href="#contact">
                Industry enquiries
              </a>

            </div>

            {/* INFORMATION */}

            <div className="footer-column">

              <h4>
                INFORMATION
              </h4>

              <a href="#industry">
                Industry engagement
              </a>

              <a href="#contact">
                Contact Information
              </a>
              <a href="tel:+919910249199">+91 9910249199</a>
              <a href="mailto:support@skills.akgec.ac.in">Email ASF</a>

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

              <a href="mailto:support@skills.akgec.ac.in">
                Need help?
                <Mail size={15} />
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
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.8" r="1" fill="currentColor" /></svg>
              </a>
              <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM3.5 10.2h3.4V21H3.5zM9 10.2h3.3v1.5h.1a3.7 3.7 0 0 1 3.3-1.8c3.5 0 4.2 2.3 4.2 5.2V21h-3.5v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21H9z" fill="currentColor" /></svg>
              </a>
              <a href="mailto:support@skills.akgec.ac.in" aria-label="Email AKGEC Skills Foundation"><Mail size={19} /></a>
            </div>

          </div>

        </div>

      </footer>

      {/* =================================================
          FLOATING SKILLMATE LINK
      ================================================= */}

      <a
        href="https://akgec-skillmate.vercel.app/"
        className="floating-whatsapp"
        aria-label="Visit AKGEC Skillmate"
      >
        <span className="floating-whatsapp-icon" aria-hidden="true">
          <MessageCircle />
          <Phone />
        </span>
      </a>

    </div>
  );
}
