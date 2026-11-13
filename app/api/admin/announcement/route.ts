import { NextRequest, NextResponse } from "next/server";
import { getAnnouncement, saveAnnouncement, type Announcement } from "@/lib/announcement";

export async function GET() {
  const announcement = await getAnnouncement();
  return NextResponse.json(announcement);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { enabled, text, linkText, linkUrl, reviewDate, style } = body ?? {};

    if (typeof enabled !== "boolean" || typeof text !== "string") {
      return NextResponse.json(
        { error: "enabled (true/false) and text are required." },
        { status: 400 }
      );
    }

    if (enabled && !text.trim()) {
      return NextResponse.json(
        { error: "Announcement text can't be empty while it's turned on." },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const trimmedLinkText = typeof linkText === "string" ? linkText.trim() : "";
    const trimmedLinkUrl = typeof linkUrl === "string" ? linkUrl.trim() : "";
    const trimmedReviewDate = typeof reviewDate === "string" ? reviewDate.trim() : "";

    if (trimmedText.length > 100) {
      return NextResponse.json(
        { error: "Announcement text must be 100 characters or fewer." },
        { status: 400 }
      );
    }

    if (trimmedLinkUrl) {
      const isInternalLink = trimmedLinkUrl.startsWith("#")
        || (trimmedLinkUrl.startsWith("/") && !trimmedLinkUrl.startsWith("//"));
      let isHttpLink = false;
      try {
        const url = new URL(trimmedLinkUrl);
        isHttpLink = url.protocol === "https:" || url.protocol === "http:";
      } catch {
        isHttpLink = false;
      }
      if (!isInternalLink && !isHttpLink) {
        return NextResponse.json(
          { error: "Use a site path or a valid HTTP(S) URL for the announcement link." },
          { status: 400 }
        );
      }
    }

    if (trimmedReviewDate) {
      const validReviewDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmedReviewDate)
        && !Number.isNaN(Date.parse(`${trimmedReviewDate}T00:00:00.000Z`))
        && new Date(`${trimmedReviewDate}T00:00:00.000Z`).toISOString().slice(0, 10) === trimmedReviewDate;
      if (!validReviewDate) {
        return NextResponse.json(
          { error: "Choose a valid review date while the announcement is on." },
          { status: 400 }
        );
      }
    }

    const announcement: Announcement = {
      enabled,
      text: trimmedText,
      linkText: trimmedLinkText,
      linkUrl: trimmedLinkUrl,
      reviewDate: trimmedReviewDate,
      style: style === "urgent" ? "urgent" : "info",
    };

    await saveAnnouncement(announcement);
    return NextResponse.json({ success: true, announcement });
  } catch (err) {
    console.error("admin announcement PUT error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// Clears the announcement entirely (resets to default: off, empty text).
export async function DELETE() {
  try {
    const cleared: Announcement = {
      enabled: false,
      text: "",
      linkText: "",
      linkUrl: "",
      reviewDate: "",
      style: "info",
    };
    await saveAnnouncement(cleared);
    return NextResponse.json({ success: true, announcement: cleared });
  } catch (err) {
    console.error("admin announcement DELETE error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}