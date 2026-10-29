import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { findCourse, findDuration } from "@/lib/courses";
import { getFormFields } from "@/lib/formFields";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";
import { verifyRegistrationChallenge } from "@/lib/registrationChallenge";
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

    const body = await readJsonBody(req, 24 * 1024);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
    }
    const { courseId, durationLabel, responses, captchaAnswer, captchaTicket } = body as Record<string, unknown>;

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

    const fields = await getFormFields();
    if (!responses || typeof responses !== "object" || Array.isArray(responses)) {
      return NextResponse.json({ error: "Registration responses are required." }, { status: 400 });
    }

    const responseValues = responses as Record<string, unknown>;
    const captchaField = fields.some((field) => field.type === "captcha");
    if (captchaField) {
      const challenge = verifyRegistrationChallenge(captchaTicket, captchaAnswer);
      if (!challenge.valid || !challenge.nonce) {
        return NextResponse.json({ error: "Security check failed. Please refresh it and try again." }, { status: 400 });
      }
      if (!allowRequest(`registration-captcha-used:${challenge.nonce}`, 1, 10 * 60_000)) {
        return NextResponse.json({ error: "This security check has already been used. Please refresh it." }, { status: 409 });
      }
    }

    const cleanResponses: Record<string, string> = {};
    for (const field of fields) {
      if (["course", "duration", "captcha"].includes(field.type)) continue;
      const rawValue = responseValues[field.id];
      const value = typeof rawValue === "string" ? rawValue.trim() : "";
      if (field.required && !value) {
        return NextResponse.json({ error: `Please fill in "${field.label}".` }, { status: 400 });
      }
      if (value.length > 500) {
        return NextResponse.json({ error: `"${field.label}" is too long.` }, { status: 400 });
      }
      if (field.type === "tel" && value && !/^\d{10}$/.test(value)) {
        return NextResponse.json({ error: `"${field.label}" must be a valid 10-digit phone number.` }, { status: 400 });
      }
      if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
        return NextResponse.json({ error: `"${field.label}" must be a valid email address.` }, { status: 400 });
      }
      if (field.type === "select" && value && !field.options?.includes(value)) {
        return NextResponse.json({ error: `Invalid selection for "${field.label}".` }, { status: 400 });
      }
      if (rawValue !== undefined && typeof rawValue !== "string") {
        return NextResponse.json({ error: `Invalid value for "${field.label}".` }, { status: 400 });
      }
      cleanResponses[field.id] = value;
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

    return NextResponse.json(
      { success: true, registrationId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    if (err instanceof RequestBodyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your registration." },
      { status: 500 }
    );
  }
}