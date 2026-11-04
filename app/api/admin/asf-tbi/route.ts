import { NextRequest, NextResponse } from "next/server";
import { getAsfTbiContent, isAsfTbiContent, saveAsfTbiContent } from "@/lib/asfTbiContent";
import { recordAdminActivity } from "@/lib/adminActivity";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";

export async function GET() {
  const content = await getAsfTbiContent();
  return NextResponse.json(content, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: NextRequest) {
  try {
    if (!allowRequest(`admin-asf-tbi-content:${getClientIdentifier(req)}`, 30, 5 * 60_000)) {
      return NextResponse.json(
        { error: "Too many content updates. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": "300", "Cache-Control": "no-store" } }
      );
    }

    const content: unknown = await readJsonBody(req, 256 * 1024);
    if (!isAsfTbiContent(content)) {
      return NextResponse.json(
        { error: "The ASF-TBI website content is incomplete or invalid." },
        { status: 400 }
      );
    }

    await saveAsfTbiContent(content);
    await recordAdminActivity({
      action: "ASF-TBI website content saved",
      entity: "Website content",
      entityId: "asf-tbi",
    });
    return NextResponse.json({ success: true, content });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin ASF-TBI content PUT error:", error);
    return NextResponse.json({ error: "Could not save ASF-TBI website content." }, { status: 500 });
  }
}
