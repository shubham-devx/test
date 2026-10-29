import path from "path";
import defaultContent from "@/data/site-content.json";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";
import { SITE_THEMES, type SiteTheme } from "@/lib/siteThemes";

export type SiteSection = "about" | "training" | "centres" | "industry";
export type IndustryFocusArea = {
  icon: "automation" | "aerospace" | "healthcare";
  name: string;
  details: string;
};

export type SiteContent = {
  theme: SiteTheme;
  navigation: { label: string; section: SiteSection }[];
  about: { label: string; heading: string; lead: string; description: string };
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
  }[];
};

export const DEFAULT_SITE_CONTENT = defaultContent as SiteContent;
const DATA_FILE = path.join(process.cwd(), "data", "site-content.json");
const sections: SiteSection[] = ["about", "training", "centres", "industry"];

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

export function isSiteContent(value: unknown): value is SiteContent {
  if (!isRecord(value) || !Array.isArray(value.navigation) || value.navigation.length !== 4) {
    return false;
  }
  if (!Object.hasOwn(SITE_THEMES, value.theme as string)) return false;

  if (!value.navigation.every((item) =>
    isRecord(item) && typeof item.label === "string" && sections.includes(item.section as SiteSection)
  )) return false;

  if (!hasTextFields(value.about, ["label", "heading", "lead", "description"])) return false;
  if (!hasTextFields(value.training, ["label", "heading", "description"])) return false;
  if (!hasTextFields(value.centres, ["label", "heading", "description"])) return false;
  if (!hasTextFields(value.industry, ["label", "heading", "description"])) return false;

  if (!Array.isArray(value.trainingPrograms) || value.trainingPrograms.length === 0 || !value.trainingPrograms.every((item) =>
    hasTextFields(item, ["icon", "title", "text"])
  )) return false;
  if (!Array.isArray(value.industryFocusAreas) || value.industryFocusAreas.length === 0 || !value.industryFocusAreas.every(isIndustryFocusArea)) return false;
  if (!Array.isArray(value.centresList) || value.centresList.length === 0 || !value.centresList.every((item) =>
    hasTextFields(item, ["name", "partner", "focus", "description", "itemsTitle", "recognition"]) &&
    Array.isArray(item.items) && item.items.every((entry: unknown) => typeof entry === "string")
  )) return false;

  return true;
}

export async function getSiteContent(): Promise<SiteContent> {
  const content = await readJsonFile<unknown>(DATA_FILE, null);
  if (isSiteContent(content)) return content;
  if (isRecord(content)) {
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
      theme: content.theme ?? DEFAULT_SITE_CONTENT.theme,
      industryFocusAreas,
    };
    if (isSiteContent(migratedContent)) return migratedContent;
  }
  return DEFAULT_SITE_CONTENT;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await writeJsonFile(DATA_FILE, content);
}
