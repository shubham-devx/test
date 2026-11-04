import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";
import {
  isAsfTbiApplicationStatus,
  normalizeAsfTbiApplicationStatus,
} from "@/lib/asfTbiApplicationStatus";
import type { AsfTbiApplicationStatus } from "@/lib/asfTbiApplicationStatus";
export { isAsfTbiApplicationStatus, normalizeAsfTbiApplicationStatus } from "@/lib/asfTbiApplicationStatus";

type LegacyAsfTbiApplicationStatus = "new" | "reviewing" | "accepted" | "declined";

export type AsfTbiApplicationHistoryEntry = {
  action: "status_changed" | "remarks_updated";
  changedAt: string;
  previousStatus?: AsfTbiApplicationStatus;
  status?: AsfTbiApplicationStatus;
  remark?: string;
};

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
  adminRemarks?: string;
  history?: AsfTbiApplicationHistoryEntry[];
};

type PersistedAsfTbiApplication = Omit<AsfTbiApplication, "status"> & {
  status: AsfTbiApplicationStatus | LegacyAsfTbiApplicationStatus;
};

const DATA_FILE = path.join(process.cwd(), "data", "asf-tbi-applications.json");
const statuses: Array<AsfTbiApplicationStatus | LegacyAsfTbiApplicationStatus> = [
  "submitted",
  "under-review",
  "shortlisted",
  "interview-scheduled",
  "approved",
  "rejected",
  "new",
  "reviewing",
  "accepted",
  "declined",
];
function isHistoryEntry(value: unknown): value is AsfTbiApplicationHistoryEntry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    (record.action === "status_changed" || record.action === "remarks_updated") &&
    typeof record.changedAt === "string" &&
    (record.previousStatus === undefined || isAsfTbiApplicationStatus(record.previousStatus)) &&
    (record.status === undefined || isAsfTbiApplicationStatus(record.status)) &&
    (record.remark === undefined || (typeof record.remark === "string" && record.remark.length <= 5_000))
  );
}

function isApplication(value: unknown): value is PersistedAsfTbiApplication {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.submittedAt === "string" &&
    typeof record.status === "string" &&
    statuses.includes(record.status as AsfTbiApplicationStatus | LegacyAsfTbiApplicationStatus) &&
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
    )) &&
    (record.adminRemarks === undefined || (typeof record.adminRemarks === "string" && record.adminRemarks.length <= 5_000)) &&
    (record.history === undefined || (
      Array.isArray(record.history) &&
      record.history.length <= 200 &&
      record.history.every(isHistoryEntry)
    ))
  );
}

export async function getAsfTbiApplications(): Promise<AsfTbiApplication[]> {
  const records = await readJsonFile<unknown>(DATA_FILE, []);
  if (!Array.isArray(records) || !records.every(isApplication)) {
    throw new Error("ASF-TBI application data is invalid.");
  }
  return records.map((record) => ({
    ...record,
    status: normalizeAsfTbiApplicationStatus(record.status),
    customFields: record.customFields ?? {},
    adminRemarks: record.adminRemarks ?? "",
    history: record.history ?? [],
  }));
}

export async function saveAsfTbiApplications(records: AsfTbiApplication[]): Promise<void> {
  await writeJsonFile(DATA_FILE, records);
}
