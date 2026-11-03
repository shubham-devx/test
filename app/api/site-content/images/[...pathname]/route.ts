import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

const imagePathPattern = /^uploads\/site-content\/(?:hero|about|industry)-[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params;
  const blobPath = pathname.join("/");
  if (!imagePathPattern.test(blobPath)) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  try {
    const image = await get(blobPath, { access: "private" });
    if (!image || image.statusCode !== 200 || image.blob.contentType !== "image/webp") {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return new Response(image.stream, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(image.blob.size),
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("public site image read error:", error);
    return NextResponse.json({ error: "Could not load the image." }, { status: 500 });
  }
}
