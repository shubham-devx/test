import path from "path";
import defaultContent from "@/data/asf-tbi-content.json";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

export type AsfTbiContent = {
  organization: { name: string; subtitle: string; tagline: string };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    image: string;
    slides: string[];
  };
  about: {
    label: string;
    title: string;
    lead: string;
    description: string;
    vision: string;
    mission: string;
    objectives: string[];
  };
  stats: { label: string; value: number; suffix: string }[];
  startups: {
    name: string;
    industry: string;
    description: string;
    founder: string;
    stage: string;
    initials: string;
  }[];
  programs: {
    title: string;
    description: string;
    eligibility: string;
    benefits: string[];
  }[];
  funding: {
    title: string;
    category: string;
    range: string;
    eligibility: string;
    benefit: string;
    notice: string;
  }[];
  mentors: {
    name: string;
    title: string;
    experience: string;
    expertise: string;
    organization: string;
    initials: string;
  }[];
  facilities: { title: string; description: string; icon: string; image: string }[];
  events: {
    title: string;
    kind: string;
    date: string;
    description: string;
    location: string;
    status: string;
  }[];
  articles: {
    title: string;
    category: string;
    date: string;
    excerpt: string;
    slug: string;
    readTime: string;
    body: string;
  }[];
  careers: {
    title: string;
    department: string;
    description: string;
    qualification: string;
    experience: string;
    applicationEmail: string;
  }[];
  application: {
    title: string;
    description: string;
    eligibility: string[];
    process: string[];
    documents: string[];
    evaluation: string[];
    criteria: string[];
    faqs: { question: string; answer: string }[];
  };
  applicationForm: {
    customFields: {
      id: string;
      label: string;
      type: "text" | "url" | "textarea" | "select";
      enabled: boolean;
      required: boolean;
      placeholder: string;
      options: string[];
    }[];
  };
  contact: {
    organization: string;
    email: string;
    phone: string;
    address: string;
    mapUrl: string;
  };
  social: { platform: string; url: string; placeholder: boolean }[];
  partners: { name: string; category: string; monogram: string }[];
  resources: {
    title: string;
    description: string;
    kind: string;
    href: string;
    availability: string;
  }[];
  demoNotice: string;
};

export const DEFAULT_ASF_TBI_CONTENT = defaultContent as AsfTbiContent;

const DATA_FILE = path.join(process.cwd(), "data", "asf-tbi-content.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matchesShape(value: unknown, shape: unknown, depth = 0): boolean {
  if (depth > 10) return false;
  if (Array.isArray(shape)) {
    return Array.isArray(value) &&
      value.length <= 100 &&
      (shape.length === 0 || value.every((item) => matchesShape(item, shape[0], depth + 1)));
  }
  if (isRecord(shape)) {
    if (!isRecord(value)) return false;
    const shapeKeys = Object.keys(shape);
    return Object.keys(value).length === shapeKeys.length &&
      shapeKeys.every((key) => Object.hasOwn(value, key) && matchesShape(value[key], shape[key], depth + 1));
  }
  if (typeof shape === "number") return typeof value === "number" && Number.isFinite(value);
  if (typeof shape === "boolean") return typeof value === "boolean";
  return typeof value === "string" && value.length <= 5_000;
}

function addContentDefaults(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const savedHero = value.hero;
  const hero = isRecord(savedHero)
    ? {
        ...savedHero,
        slides: savedHero.slides === undefined
          ? DEFAULT_ASF_TBI_CONTENT.hero.slides.filter((slide) => slide !== savedHero.image)
          : savedHero.slides,
      }
    : savedHero;
  const facilities = Array.isArray(value.facilities)
    ? value.facilities.map((facility, index) => {
        if (!isRecord(facility) || facility.image !== undefined) return facility;
        const defaultFacility = DEFAULT_ASF_TBI_CONTENT.facilities[index % DEFAULT_ASF_TBI_CONTENT.facilities.length];
        return { ...facility, image: defaultFacility.image };
      })
    : value.facilities;
  return {
    ...value,
    hero,
    facilities,
    applicationForm: value.applicationForm === undefined
      ? DEFAULT_ASF_TBI_CONTENT.applicationForm
      : value.applicationForm,
  };
}

function isSafeImageSource(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isAsfTbiContent(value: unknown): value is AsfTbiContent {
  const content = addContentDefaults(value);
  if (!content) return false;
  if (!matchesShape(content, DEFAULT_ASF_TBI_CONTENT)) return false;

  const hero = content.hero;
  const contact = content.contact;
  const social = content.social;
  const careers = content.careers;
  const resources = content.resources;
  const articles = content.articles;
  const events = content.events;

  if (!isRecord(hero) || !isSafeImageSource(hero.image)) return false;
  if (!Array.isArray(hero.slides) || hero.slides.length > 10 || !hero.slides.every(isSafeImageSource)) return false;
  if (!isRecord(contact) || typeof contact.email !== "string" || typeof contact.mapUrl !== "string") return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return false;
  try {
    if (new URL(contact.mapUrl).protocol !== "https:") return false;
  } catch {
    return false;
  }

  if (!Array.isArray(social) || !social.every((link) => {
    if (!isRecord(link) || typeof link.url !== "string") return false;
    try {
      return new URL(link.url).protocol === "https:";
    } catch {
      return false;
    }
  })) return false;

  if (!Array.isArray(careers) || !careers.every((role) =>
    isRecord(role) && typeof role.applicationEmail === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(role.applicationEmail)
  )) return false;

  if (!Array.isArray(resources) || !resources.every((resource) => {
    if (!isRecord(resource) || typeof resource.href !== "string" || resource.href === "") return true;
    try {
      return new URL(resource.href).protocol === "https:";
    } catch {
      return false;
    }
  })) return false;

  if (!Array.isArray(articles)) return false;
  const slugs = articles.map((article) => isRecord(article) ? article.slug : undefined);
  if (!slugs.every((slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) return false;
  if (new Set(slugs).size !== slugs.length) return false;

  if (!Array.isArray(events) || !events.every((event) =>
    isRecord(event) && typeof event.status === "string" &&
    ["upcoming", "previous"].includes(event.status)
  )) return false;

  if (!Array.isArray(content.facilities) || !content.facilities.every((facility) =>
    isRecord(facility) && isSafeImageSource(facility.image)
  )) return false;

  const applicationForm = content.applicationForm;
  if (!isRecord(applicationForm) || !Array.isArray(applicationForm.customFields)) return false;
  const reservedFieldIds = new Set([
    "founderName", "email", "phone", "startupName", "website", "stage", "industry", "city",
    "teamSize", "problem", "solution", "description", "traction", "supportNeeds", "pitchDeckUrl",
    "websiteField", "consent",
  ]);
  if (!applicationForm.customFields.every((field) => {
    if (!isRecord(field) || typeof field.id !== "string" || !/^[a-z][a-zA-Z0-9_-]{0,39}$/.test(field.id)) return false;
    if (reservedFieldIds.has(field.id) || typeof field.label !== "string" || !field.label.trim()) return false;
    if (!["text", "url", "textarea", "select"].includes(String(field.type))) return false;
    if (typeof field.enabled !== "boolean" || typeof field.required !== "boolean" || (!field.enabled && field.required)) return false;
    if (typeof field.placeholder !== "string" || field.placeholder.length > 200) return false;
    if (!Array.isArray(field.options) || field.options.length > 20 || !field.options.every((option) => typeof option === "string" && option.length <= 100)) return false;
    return field.type !== "select" || field.options.length > 0;
  })) return false;
  const fieldIds = applicationForm.customFields.map((field) => isRecord(field) ? field.id : undefined);
  if (new Set(fieldIds).size !== fieldIds.length) return false;
  return true;
}

export async function getAsfTbiContent(): Promise<AsfTbiContent> {
  const content = addContentDefaults(await readJsonFile<unknown>(DATA_FILE, null));
  return content && isAsfTbiContent(content) ? content : DEFAULT_ASF_TBI_CONTENT;
}

export async function saveAsfTbiContent(content: AsfTbiContent): Promise<void> {
  await writeJsonFile(DATA_FILE, content);
}
