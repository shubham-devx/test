import path from "path";
import defaultContent from "@/data/site-content.json";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";
import { isValidSiteImageUrl, normalizeIndustryImageUrl } from "@/lib/siteImage";
import { SITE_THEMES, type SiteTheme } from "@/lib/siteThemes";

export type SiteSection = "about" | "training" | "centres" | "industry";
export type SiteImageSlot = "hero" | "about" | "industry";
export type IndustryFocusArea = {
  icon: "automation" | "aerospace" | "healthcare";
  name: string;
  details: string;
};

export type SiteContent = {
  theme: SiteTheme;
  images: {
    hero: string;
    about: string;
    industry: string;
  };
  navigation: { label: string; section: SiteSection }[];
  about: {
    label: string;
    heading: string;
    lead: string;
    description: string;
    keyFocusAreas: { title: string; description: string }[];
  };
  training: { label: string; heading: string; description: string };
  centres: { label: string; heading: string; description: string };
  industry: { label: string; heading: string; description: string };
  trainingPrograms: { icon: string; title: string; text: string }[];
  industryFocusAreas: IndustryFocusArea[];
  centresList: {
    name: string;
    partner: string;
    focus: string;
    description: string;
    itemsTitle: string;
    items: string[];
    recognition: string;
    details?: string[];
  }[];
};

export const DEFAULT_SITE_CONTENT = defaultContent as SiteContent;
const DATA_FILE = path.join(process.cwd(), "data", "site-content.json");
const CONTENT_VERSION_FILE = path.join(process.cwd(), "data", "site-content-version.json");
const CONTENT_VERSION = 7;
const sections: SiteSection[] = ["about", "training", "centres", "industry"];
const LEGACY_COPY = {
  about: {
    label: "About the Foundation",
    heading: "Industry skills built through hands-on learning",
    lead: "AKGEC Skills Foundation (ASF) is promoted by Ajay Kumar Garg Engineering College, Ghaziabad, and the National Skill Development Corporation under the Ministry of Skill Development and Entrepreneurship, Government of India. Its aim is to expand young people's employment opportunities and strengthen the skills and productivity of the existing workforce.",
    description: "ASF advances training, education and research in industrial automation, robotics, digital manufacturing and fabrication. Learners gain practical experience through industry-linked programmes, while regional enterprises can access product development, prototyping, production trials, 3D measurement, metrology, reverse engineering and advanced manufacturing services.",
  },
  training: {
    label: "Training & Programmes",
    heading: "Build capability and make technology work",
    description: "Learn by working with the tools, systems and standards used across modern industry, guided by experienced trainers and industry partners.",
  },
  centres: {
    label: "Centres of Excellence",
    heading: "Where industry becomes hands-on",
    description: "Explore specialist labs and academies for robotics, welding, automation, manufacturing, metrology, pneumatics, digital fabrication and drone technology.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasTextFields(value: unknown, fields: string[]): boolean {
  return isRecord(value) && fields.every((field) => typeof value[field] === "string");
}

function isIndustryFocusArea(value: unknown): value is IndustryFocusArea {
  return isRecord(value) &&
    typeof value.icon === "string" &&
    typeof value.name === "string" &&
    typeof value.details === "string" &&
    ["automation", "aerospace", "healthcare"].includes(value.icon);
}

function isAboutFocusArea(value: unknown): value is SiteContent["about"]["keyFocusAreas"][number] {
  return hasTextFields(value, ["title", "description"]);
}

export function isSiteContent(value: unknown): value is SiteContent {
  if (!isRecord(value) || !Array.isArray(value.navigation) || value.navigation.length !== 3) {
    return false;
  }
  if (!Object.hasOwn(SITE_THEMES, value.theme as string)) return false;

  if (!isRecord(value.images) ||
    !isValidSiteImageUrl(value.images.hero) ||
    !isValidSiteImageUrl(value.images.about) ||
    !isValidSiteImageUrl(value.images.industry)) return false;

  if (!value.navigation.every((item) =>
    isRecord(item) && typeof item.label === "string" && sections.includes(item.section as SiteSection)
  )) return false;

  if (!hasTextFields(value.about, ["label", "heading", "lead", "description"]) ||
    !isRecord(value.about) ||
    !Array.isArray(value.about.keyFocusAreas) ||
    !value.about.keyFocusAreas.every(isAboutFocusArea)) return false;
  if (!hasTextFields(value.training, ["label", "heading", "description"])) return false;
  if (!hasTextFields(value.centres, ["label", "heading", "description"])) return false;
  if (!hasTextFields(value.industry, ["label", "heading", "description"])) return false;

  if (!Array.isArray(value.trainingPrograms) || value.trainingPrograms.length === 0 || !value.trainingPrograms.every((item) =>
    hasTextFields(item, ["icon", "title", "text"])
  )) return false;
  if (!Array.isArray(value.industryFocusAreas) || value.industryFocusAreas.length === 0 || !value.industryFocusAreas.every(isIndustryFocusArea)) return false;
  if (!Array.isArray(value.centresList) || value.centresList.length === 0 || !value.centresList.every((item) =>
    hasTextFields(item, ["name", "partner", "focus", "description", "itemsTitle", "recognition"]) &&
    Array.isArray(item.items) && item.items.every((entry: unknown) => typeof entry === "string") &&
    (item.details === undefined || (Array.isArray(item.details) && item.details.every((entry: unknown) => typeof entry === "string")))
  )) return false;

  return true;
}

export async function getSiteContent(): Promise<SiteContent> {
  const content = await readJsonFile<unknown>(DATA_FILE, null);
  if (isSiteContent(content)) {
    const contentVersion = await readJsonFile<number>(CONTENT_VERSION_FILE, 0);
    if (contentVersion < CONTENT_VERSION) {
      const migratedContent = {
        ...content,
        ...(contentVersion < 1 ? { trainingPrograms: DEFAULT_SITE_CONTENT.trainingPrograms } : {}),
        navigation: combineNavigation(content.navigation),
        centresList: mergeCentreDetails(content.centresList),
        ...(contentVersion < CONTENT_VERSION ? {
          about: migrateSectionCopy<SiteContent["about"]>(content.about, LEGACY_COPY.about, DEFAULT_SITE_CONTENT.about),
          training: migrateSectionCopy(content.training, LEGACY_COPY.training, DEFAULT_SITE_CONTENT.training),
          centres: migrateSectionCopy(content.centres, LEGACY_COPY.centres, DEFAULT_SITE_CONTENT.centres),
        } : {}),
        images: {
          ...DEFAULT_SITE_CONTENT.images,
          ...content.images,
          industry: normalizeIndustryImageUrl(content.images.industry),
        },
      };
      await writeJsonFile(DATA_FILE, migratedContent);
      await writeJsonFile(CONTENT_VERSION_FILE, CONTENT_VERSION);
      return migratedContent;
    }
    return content;
  }
  if (isRecord(content)) {
    const contentVersion = await readJsonFile<number>(CONTENT_VERSION_FILE, 0);
    const industryFocusAreas = Array.isArray(content.industryFocusAreas)
      ? content.industryFocusAreas.map((area) => {
        if (typeof area !== "string") return area;
        return DEFAULT_SITE_CONTENT.industryFocusAreas.find((defaultArea) => defaultArea.name === area) ?? {
          icon: "automation",
          name: area,
          details: "Explore how ASF's technical training, facilities and industry collaboration can contribute to this area.",
        };
      })
      : DEFAULT_SITE_CONTENT.industryFocusAreas;
    const migratedContent = {
      ...content,
      navigation: combineNavigation(content.navigation),
      centresList: Array.isArray(content.centresList)
        ? mergeCentreDetails(content.centresList)
        : DEFAULT_SITE_CONTENT.centresList,
      about: migrateSectionCopy<SiteContent["about"]>(content.about, LEGACY_COPY.about, DEFAULT_SITE_CONTENT.about),
      training: migrateSectionCopy(content.training, LEGACY_COPY.training, DEFAULT_SITE_CONTENT.training),
      centres: migrateSectionCopy(content.centres, LEGACY_COPY.centres, DEFAULT_SITE_CONTENT.centres),
      theme: content.theme ?? DEFAULT_SITE_CONTENT.theme,
      trainingPrograms: contentVersion < 1
        ? DEFAULT_SITE_CONTENT.trainingPrograms
        : content.trainingPrograms ?? DEFAULT_SITE_CONTENT.trainingPrograms,
      images: {
        ...DEFAULT_SITE_CONTENT.images,
        ...(isRecord(content.images) ? content.images : {}),
        industry: normalizeIndustryImageUrl(
          isRecord(content.images) && typeof content.images.industry === "string"
            ? content.images.industry
            : DEFAULT_SITE_CONTENT.images.industry
        ),
      },
      industryFocusAreas,
    };
    if (isSiteContent(migratedContent)) {
      await writeJsonFile(DATA_FILE, migratedContent);
      await writeJsonFile(CONTENT_VERSION_FILE, CONTENT_VERSION);
      return migratedContent;
    }
  }
  return DEFAULT_SITE_CONTENT;
}

function migrateSectionCopy<T extends object>(
  current: unknown,
  previous: Partial<T>,
  defaults: T,
): T {
  const existing = isRecord(current) ? current : {};
  return Object.fromEntries(
    Object.entries(defaults).map(([field, value]) => [
      field,
      Array.isArray(value)
        ? Array.isArray(existing[field]) && existing[field].length > 0
          ? existing[field]
          : value
        : typeof existing[field] === "string" &&
            existing[field] !== (previous as Record<string, unknown>)[field]
          ? existing[field]
          : value,
    ]),
  ) as T;
}

function combineNavigation(value: unknown): SiteContent["navigation"] {
  const navigation = Array.isArray(value) ? value.filter(isRecord) : [];
  return DEFAULT_SITE_CONTENT.navigation.map((item) => {
    const existing = navigation.find((entry) => entry.section === item.section);
    return {
      ...item,
      label: item.section === "centres" || typeof existing?.label !== "string"
        ? item.label
        : existing.label,
    };
  });
}

function mergeCentreDetails(value: SiteContent["centresList"]): SiteContent["centresList"];
function mergeCentreDetails(value: unknown): unknown;
function mergeCentreDetails(value: unknown): unknown {
  if (!Array.isArray(value)) return DEFAULT_SITE_CONTENT.centresList;
  return value.map((entry) => {
    if (!isRecord(entry) || typeof entry.name !== "string") return entry;
    const defaults = DEFAULT_SITE_CONTENT.centresList.find((centre) => centre.name === entry.name);
    return defaults?.details && (!Array.isArray(entry.details) || entry.details.length === 0)
      ? { ...entry, details: defaults.details }
      : entry;
  });
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await writeJsonFile(DATA_FILE, content);
}
