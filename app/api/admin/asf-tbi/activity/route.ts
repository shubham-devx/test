import { NextResponse } from "next/server";
import { getAdminActivities } from "@/lib/adminActivity";

export async function GET() {
  try {
    const activities = await getAdminActivities();
    return NextResponse.json({ activities }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin ASF-TBI activity GET error:", error);
    return NextResponse.json({ error: "Could not load admin activity." }, { status: 500 });
  }
}
