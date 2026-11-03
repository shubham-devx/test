import { NextResponse } from "next/server";
import { getAsfTbiContent } from "@/lib/asfTbiContent";

export async function GET() {
  const content = await getAsfTbiContent();
  return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
}
