import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const maximumImageBytes = 4 * 1024 * 1024;
const maximumRequestBytes = maximumImageBytes + 64 * 1024;
const imageSlots = ["hero", "about", "industry"] as const;
type ImageSlot = (typeof imageSlots)[number];

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumRequestBytes) {
    return NextResponse.json({ error: "The image is too large to upload." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Choose an image and try uploading again." }, { status: 400 });
  }

  const image = formData.get("image");
  const slot = formData.get("slot");
  if (typeof slot !== "string" || !imageSlots.includes(slot as ImageSlot) ||
    typeof File === "undefined" || !(image instanceof File)) {
    return NextResponse.json({ error: "Choose a valid homepage image to upload." }, { status: 400 });
  }

  if (image.type !== "image/webp" || image.size === 0 || image.size > maximumImageBytes) {
    return NextResponse.json({ error: "Upload a valid WebP image smaller than 4 MB." }, { status: 400 });
  }

  let optimizedImage: Buffer;
  try {
    const source = Buffer.from(await image.arrayBuffer());
    const metadata = await sharp(source, { limitInputPixels: 80_000_000 }).metadata();
    if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
      return NextResponse.json({ error: "The uploaded file is not a valid image." }, { status: 400 });
    }

    optimizedImage = await sharp(source, { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86, effort: 4 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "The uploaded file could not be processed as an image." }, { status: 400 });
  }

  const imagePath = `uploads/site-content/${slot}-${randomUUID()}.webp`;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(imagePath, optimizedImage, {
        access: "private",
        addRandomSuffix: false,
        contentType: "image/webp",
        cacheControlMaxAge: 31_536_000,
      });
      return NextResponse.json(
        { url: `/api/site-content/images/${blob.pathname}` },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "Image storage is not configured. Set BLOB_READ_WRITE_TOKEN to enable uploads." },
        { status: 503 }
      );
    }

    const filePath = path.join(process.cwd(), "public", imagePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, optimizedImage);

    return NextResponse.json(
      { url: `/${imagePath}` },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("admin site image upload error:", error);
    return NextResponse.json({ error: "Could not save the uploaded image." }, { status: 500 });
  }
}
