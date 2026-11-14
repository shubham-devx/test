import type { Course } from "@/lib/courses";
import type { SiteContent } from "@/lib/siteContent";

type Centre = SiteContent["centresList"][number];

const COURSE_BY_CENTRE_SLUG: Record<string, string> = {
  "kuka-industrial-robotics-training-centre": "AKGEC-KUKA Centre",
  "fronius-advance-welding-technology-and-research-centre": "AWTRC",
  "siemens-advance-manufacturing-centre": "AMC",
  "ni-labview-academy": "AKGEC-NI LabVIEW Academy",
  "bosch-rexroth-centre-of-competence-in-automation-technologies": "AKGEC-BOSCH CEAT",
  "aia-centre-for-integrated-automation": "AIA-CIA",
  "siemens-plm-centre-of-excellence": "AKGEC-SIEMENS PLM",
  "fab-lab-centre-of-digital-manufacturing": "AKGEC-FABLAB",
  "bosch-joint-certification-centre": "BOSCH JCC",
  "siemens-centre-of-excellence-in-automation": "AKGEC-SIEMENS COE",
  "common-facility-center-cfc": "CFC-AFIPD",
};

export function getCentreSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCentreImage(name: string): string {
  const centre = name.toLowerCase();
  if (centre.includes("drone")) return "/images/hero/asf-robotics.jpg";
  if (centre.includes("bosch") && centre.includes("rexroth")) return "/images/centres/bosch-rexroth-lab.jpg";
  if (centre.includes("fronius") || centre.includes("welding")) return "/images/centres/fronius-training.jpg";
  if (centre.includes("kuka")) return "/images/centres/kuka-training.jpg";
  if (centre.includes("labview")) return "/images/centres/ni-labview-training.jpg";
  if (centre.includes("siemens plm") || centre.includes("product lifecycle")) return "/images/centres/siemens-plm-training.png";
  if (centre.includes("fab lab") || centre.includes("fablab")) return "/images/hero/asf-fablab.jpg";
  if (
    centre.includes("manufacturing") ||
    centre.includes("plm") ||
    centre.includes("automotive") ||
    centre.includes("calibration") ||
    centre.includes("testing") ||
    centre.includes("joint certification") ||
    centre.includes("common facility")
  ) {
    return "/images/industry/industrial-services.jpg";
  }
  if (
    centre.includes("automation") ||
    centre.includes("bosch") ||
    centre.includes("siemens") ||
    centre.includes("mitsubishi") ||
    centre.includes("janatics")
  ) {
    return "/images/hero/asf-training.jpg";
  }
  return "/images/hero/asf-main.jpg";
}

export function getCourseForCentre(centre: Centre, courses: Course[]): Course | undefined {
  const courseName = COURSE_BY_CENTRE_SLUG[getCentreSlug(centre.name)];
  return courseName ? courses.find((course) => course.name === courseName) : undefined;
}
