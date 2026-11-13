import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

const FILE = path.join(process.cwd(), "data", "announcement.json");

export type Announcement = {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  reviewDate?: string;
  style: "info" | "urgent";
};

const DEFAULT_ANNOUNCEMENT: Announcement = {
  enabled: false,
  text: "",
  linkText: "",
  linkUrl: "",
  reviewDate: "",
  style: "info",
};

export async function getAnnouncement(): Promise<Announcement> {
  const saved = await readJsonFile<Partial<Announcement> | null>(FILE, null);
  return { ...DEFAULT_ANNOUNCEMENT, ...(saved ?? {}) };
}

export async function saveAnnouncement(a: Announcement): Promise<void> {
  await writeJsonFile(FILE, a);
}