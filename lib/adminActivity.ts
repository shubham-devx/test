import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

export type AdminActivity = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  occurredAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "admin-activity.json");

function isAdminActivity(value: unknown): value is AdminActivity {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.action === "string" &&
    typeof record.entity === "string" &&
    typeof record.entityId === "string" &&
    typeof record.occurredAt === "string"
  );
}

export async function getAdminActivities(): Promise<AdminActivity[]> {
  const activities = await readJsonFile<unknown>(DATA_FILE, []);
  if (!Array.isArray(activities) || !activities.every(isAdminActivity)) {
    throw new Error("Admin activity data is invalid.");
  }
  return activities.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export async function recordAdminActivity(
  activity: Omit<AdminActivity, "id" | "occurredAt">
): Promise<void> {
  const activities = await getAdminActivities();
  activities.unshift({
    ...activity,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
  });
  await writeJsonFile(DATA_FILE, activities.slice(0, 200));
}
