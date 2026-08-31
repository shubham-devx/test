import { NextRequest, NextResponse } from "next/server";
import { getAnnouncement, saveAnnouncement, type Announcement } from "@/lib/announcement";

export async function GET() {
  const announcement = await getAnnouncement();
  return NextResponse.json(announcement);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { enabled, text, linkText, linkUrl, style } = body ?? {};

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

    const announcement: Announcement = {
      enabled,
      text: text.trim(),
      linkText: typeof linkText === "string" ? linkText.trim() : "",
      linkUrl: typeof linkUrl === "string" ? linkUrl.trim() : "",
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
      style: "info",
    };
    await saveAnnouncement(cleared);
    return NextResponse.json({ success: true, announcement: cleared });
  } catch (err) {
    console.error("admin announcement DELETE error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}