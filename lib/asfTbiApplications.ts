import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

export type AsfTbiApplicationStatus = "new" | "reviewing" | "shortlisted" | "accepted" | "declined";

export type AsfTbiApplication = {
  id: string;
  submittedAt: string;
  status: AsfTbiApplicationStatus;
  founderName: string;
  email: string;
  phone: string;
  startupName: string;
  website: string;
  stage: string;
  industry: string;
  city: string;
  teamSize: number;
  problem: string;
  solution: string;
  description: string;
  traction: string;
  supportNeeds: string;
  pitchDeckUrl: string;
  customFields: Record<string, { label: string; value: string }>;
};

const DATA_FILE = path.join(process.cwd(), "data", "asf-tbi-applications.json");
const statuses: AsfTbiApplicationStatus[] = ["new", "reviewing", "shortlisted", "accepted", "declined"];

function isApplication(value: unknown): value is AsfTbiApplication {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.submittedAt === "string" &&
    typeof record.status === "string" &&
    statuses.includes(record.status as AsfTbiApplicationStatus) &&
    typeof record.founderName === "string" &&
    typeof record.email === "string" &&
    typeof record.phone === "string" &&
    typeof record.startupName === "string" &&
    typeof record.website === "string" &&
    typeof record.stage === "string" &&
    typeof record.industry === "string" &&
    typeof record.city === "string" &&
    typeof record.teamSize === "number" &&
    typeof record.problem === "string" &&
    typeof record.solution === "string" &&
    typeof record.description === "string" &&
    typeof record.traction === "string" &&
    typeof record.supportNeeds === "string" &&
    typeof record.pitchDeckUrl === "string" &&
    (record.customFields === undefined || (
      typeof record.customFields === "object" &&
      record.customFields !== null &&
      !Array.isArray(record.customFields) &&
      Object.values(record.customFields).every((answer) =>
        typeof answer === "object" &&
        answer !== null &&
        typeof answer.label === "string" &&
        typeof answer.value === "string"
      )
    ))
  );
}

export function isAsfTbiApplicationStatus(value: unknown): value is AsfTbiApplicationStatus {
  return typeof value === "string" && statuses.includes(value as AsfTbiApplicationStatus);
}

export async function getAsfTbiApplications(): Promise<AsfTbiApplication[]> {
  const records = await readJsonFile<unknown>(DATA_FILE, []);
  if (!Array.isArray(records) || !records.every(isApplication)) {
    throw new Error("ASF-TBI application data is invalid.");
  }
  return records.map((record) => ({ ...record, customFields: record.customFields ?? {} }));
}

export async function saveAsfTbiApplications(records: AsfTbiApplication[]): Promise<void> {
  await writeJsonFile(DATA_FILE, records);
}
