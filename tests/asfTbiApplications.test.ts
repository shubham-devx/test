import { describe, expect, it } from "vitest";
import { normalizeAsfTbiApplicationStatus } from "../lib/asfTbiApplicationStatus";

describe("ASF-TBI application status compatibility", () => {
  it("maps existing application statuses to the current review workflow", () => {
    expect(normalizeAsfTbiApplicationStatus("new")).toBe("submitted");
    expect(normalizeAsfTbiApplicationStatus("reviewing")).toBe("under-review");
    expect(normalizeAsfTbiApplicationStatus("accepted")).toBe("approved");
    expect(normalizeAsfTbiApplicationStatus("declined")).toBe("rejected");
  });

  it("keeps current statuses unchanged", () => {
    expect(normalizeAsfTbiApplicationStatus("interview-scheduled")).toBe("interview-scheduled");
    expect(normalizeAsfTbiApplicationStatus("shortlisted")).toBe("shortlisted");
  });
});
