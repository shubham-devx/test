import { NextResponse } from "next/server";
import { getAnnouncement } from "@/lib/announcement";

export const dynamic = "force-dynamic";

export async function GET() {
  const announcement = await getAnnouncement();
  return NextResponse.json(announcement, {
    headers: { "Cache-Control": "no-store" },
  });
}
