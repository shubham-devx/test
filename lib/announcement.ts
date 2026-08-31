import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "announcement.json");

export type Announcement = {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  style: "info" | "urgent";
};

const DEFAULT_ANNOUNCEMENT: Announcement = {
  enabled: false,
  text: "",
  linkText: "",
  linkUrl: "",
  style: "info",
};

export async function getAnnouncement(): Promise<Announcement> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return { ...DEFAULT_ANNOUNCEMENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ANNOUNCEMENT;
  }
}

export async function saveAnnouncement(a: Announcement): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(a, null, 2), "utf-8");
}