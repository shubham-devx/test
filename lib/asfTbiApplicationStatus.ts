export type AsfTbiApplicationStatus =
  | "submitted"
  | "under-review"
  | "shortlisted"
  | "interview-scheduled"
  | "approved"
  | "rejected";

type LegacyAsfTbiApplicationStatus = "new" | "reviewing" | "accepted" | "declined";

const currentStatuses: AsfTbiApplicationStatus[] = [
  "submitted",
  "under-review",
  "shortlisted",
  "interview-scheduled",
  "approved",
  "rejected",
];

export function isAsfTbiApplicationStatus(value: unknown): value is AsfTbiApplicationStatus {
  return typeof value === "string" && currentStatuses.includes(value as AsfTbiApplicationStatus);
}

export function normalizeAsfTbiApplicationStatus(
  status: AsfTbiApplicationStatus | LegacyAsfTbiApplicationStatus
): AsfTbiApplicationStatus {
  switch (status) {
    case "new":
      return "submitted";
    case "reviewing":
      return "under-review";
    case "accepted":
      return "approved";
    case "declined":
      return "rejected";
    default:
      return status;
  }
}
