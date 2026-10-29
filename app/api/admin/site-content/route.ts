import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, isSiteContent, saveSiteContent } from "@/lib/siteContent";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  try {
    const content: unknown = await readJsonBody(req, 128 * 1024);
    if (!isSiteContent(content)) {
      return NextResponse.json({ error: "The website content is incomplete or invalid." }, { status: 400 });
    }

    await saveSiteContent(content);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin site content PUT error:", error);
    return NextResponse.json({ error: "Could not save website content." }, { status: 500 });
  }
}
