import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const storage = vi.hoisted(() => ({
  applications: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/asfTbiApplications", () => ({
  getAsfTbiApplications: async () => storage.applications,
  saveAsfTbiApplications: async (applications: Array<Record<string, unknown>>) => {
    storage.applications = applications;
  },
}));

vi.mock("@/lib/asfTbiContent", () => ({
  getAsfTbiContent: async () => ({ applicationForm: { customFields: [] } }),
}));

import { POST } from "../app/api/asf-tbi/applications/route";
import { GET as getAdminApplications } from "../app/api/admin/asf-tbi/applications/route";

function applicationRequest(payload: unknown): NextRequest {
  return new NextRequest("http://localhost/api/asf-tbi/applications", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `192.0.2.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify(payload),
  });
}

describe("ASF-TBI application submission and admin visibility", () => {
  beforeEach(() => {
    storage.applications = [];
  });

  it("saves a valid application and returns it through the protected admin listing handler", async () => {
    const submitted = await POST(applicationRequest({
      founderName: "Test Founder",
      email: "founder@example.com",
      phone: "+91 98765 43210",
      startupName: "Verified Test Venture",
      website: "",
      stage: "Idea",
      industry: "Artificial intelligence",
      city: "Ghaziabad",
      teamSize: 2,
      problem: "Testing application submission.",
      solution: "Submit to the application API and verify the admin list.",
      description: "An isolated integration test using in-memory persistence.",
      traction: "",
      supportNeeds: "Mentorship",
      pitchDeckUrl: "",
      websiteField: "",
      consent: true,
      customFields: {},
    }));
    const submission = await submitted.json();

    expect(submitted.status).toBe(201);
    expect(submission.success).toBe(true);
    expect(submission.applicationId).toMatch(/^TBI-/);

    const listed = await getAdminApplications();
    const result = await listed.json();

    expect(listed.status).toBe(200);
    expect(result.applications).toHaveLength(1);
    expect(result.applications[0]).toMatchObject({
      id: submission.applicationId,
      founderName: "Test Founder",
      startupName: "Verified Test Venture",
      status: "submitted",
    });
  });

  it("returns validation errors without adding an application", async () => {
    const response = await POST(applicationRequest({ consent: false }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Please confirm that ASF-TBI may contact you about this application.",
    });
    expect(storage.applications).toHaveLength(0);
  });
});
