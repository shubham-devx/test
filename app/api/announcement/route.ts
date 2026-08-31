import { NextResponse } from "next/server";
import { getAnnouncement } from "@/lib/announcement";

export async function GET() {
  const announcement = await getAnnouncement();
  return NextResponse.json(announcement);
}
