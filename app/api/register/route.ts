import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { findCourse, findDuration } from "@/lib/courses";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

const DATA_FILE = path.join(process.cwd(), "data", "registrations.json");

function generateRegistrationId(courseId: string) {
  const year = new Date().getFullYear();
  const prefix = courseId.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ASF-${prefix}-${year}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!allowRequest(`registration:${getClientIdentifier(req)}`, 8, 60_000)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a minute and try again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { courseId, durationLabel, responses } = body ?? {};

    if (
      typeof courseId !== "string" ||
      typeof durationLabel !== "string" ||
      courseId.length > 120 ||
      durationLabel.length > 120
    ) {
      return NextResponse.json({ error: "Missing course or duration selection." }, { status: 400 });
    }

    const [course, duration] = await Promise.all([
      findCourse(courseId),
      findDuration(courseId, durationLabel),
    ]);
    if (!course || !duration) {
      return NextResponse.json({ error: "Invalid course or duration selected." }, { status: 400 });
    }

    const cleanResponses: Record<string, string> = {};
    if (responses && typeof responses === "object") {
      for (const [key, value] of Object.entries(responses)) {
        if (["course", "duration", "captcha"].includes(key)) continue;
        cleanResponses[key] = String(value ?? "").trim().slice(0, 500);
      }
    }

    const registrationId = generateRegistrationId(course.id);
    const record = {
      registrationId,
      responses: cleanResponses,
      course: course.name,
      duration: duration.label,
      amount: duration.fee,
      paymentId: "",
      orderId: "",
      registeredAt: new Date().toISOString(),
      status: "new",
      paymentStatus: "pending",
    };

    const saved = await readJsonFile<unknown>(DATA_FILE, []);
    const existing: unknown[] = Array.isArray(saved) ? saved : [];
    existing.push(record);
    await writeJsonFile(DATA_FILE, existing);

    return NextResponse.json({ success: true, registrationId });
  } catch (err) {
    console.error("registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your registration." },
      { status: 500 }
    );
  }
}