import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const storage = vi.hoisted(() => ({
  announcement: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/announcement", () => ({
  getAnnouncement: async () => storage.announcement,
  saveAnnouncement: async (announcement: Record<string, unknown>) => {
    storage.announcement = announcement;
  },
}));

import { PUT } from "../app/api/admin/announcement/route";

function announcementRequest(payload: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/announcement", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const validAnnouncement = {
  enabled: true,
  text: "Applications are open for the next training batch.",
  linkText: "View courses",
  linkUrl: "/#training",
  reviewDate: "2026-12-01",
  style: "info",
};

describe("announcement settings", () => {
  beforeEach(() => {
    storage.announcement = null;
  });

  it("saves a short notice with an action link and review date", async () => {
    const response = await PUT(announcementRequest(validAnnouncement));

    expect(response.status).toBe(200);
    expect((await response.json()).announcement).toMatchObject(validAnnouncement);
    expect(storage.announcement).toMatchObject(validAnnouncement);

    const fragmentLink = await PUT(announcementRequest({
      ...validAnnouncement,
      linkUrl: "#training",
    }));
    expect(fragmentLink.status).toBe(200);
  });

  it("allows an active announcement without optional link or review date", async () => {
    const response = await PUT(announcementRequest({
      enabled: true,
      text: "Applications are open.",
    }));

    expect(response.status).toBe(200);
    expect((await response.json()).announcement).toMatchObject({
      enabled: true,
      text: "Applications are open.",
      linkText: "",
      linkUrl: "",
      reviewDate: "",
    });
  });

  it("rejects long messages, unsafe links, and invalid review dates", async () => {
    const tooLong = await PUT(announcementRequest({
      ...validAnnouncement,
      text: "a".repeat(101),
    }));
    expect(tooLong.status).toBe(400);

    const unsafeLink = await PUT(announcementRequest({
      ...validAnnouncement,
      linkUrl: "javascript:alert(1)",
    }));
    expect(unsafeLink.status).toBe(400);

    const invalidDate = await PUT(announcementRequest({
      ...validAnnouncement,
      reviewDate: "2026-02-30",
    }));
    expect(invalidDate.status).toBe(400);
    expect(storage.announcement).toBeNull();
  });
});
