import { NextRequest, NextResponse } from "next/server";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";
import {
  getAsfTbiApplications,
  saveAsfTbiApplications,
  type AsfTbiApplication,
} from "@/lib/asfTbiApplications";
import { validateAsfTbiApplicationAnswers } from "@/lib/asfTbiApplicationForm";
import { getAsfTbiContent } from "@/lib/asfTbiContent";

const requiredTextFields = [
  "founderName",
  "email",
  "phone",
  "startupName",
  "stage",
  "industry",
  "city",
  "problem",
  "solution",
  "description",
  "supportNeeds",
] as const;

const optionalTextFields = ["website", "traction", "pitchDeckUrl"] as const;
const MAX_FIELD_LENGTH = 2_000;
const startupStages = ["Idea", "Validation", "Prototype", "MVP", "Early revenue", "Scaling"];
const startupIndustries = [
  "Artificial intelligence",
  "Aerospace & defence",
  "Clean energy & climate",
  "Education",
  "Healthcare",
  "Manufacturing",
  "Agriculture",
  "Mobility",
  "Other",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, field: string, required: boolean): string {
  if (typeof value !== "string") {
    if (!required && value === undefined) return "";
    throw new RequestBodyError(`Please provide a valid ${field}.`, 400);
  }
  const clean = value.trim();
  if (clean.length > MAX_FIELD_LENGTH) {
    throw new RequestBodyError(`${field} must be ${MAX_FIELD_LENGTH} characters or fewer.`, 400);
  }
  if (required && !clean) throw new RequestBodyError(`Please fill in ${field}.`, 400);
  return clean;
}

function isSecureOptionalUrl(value: string): boolean {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!allowRequest(`asf-tbi-application:${getClientIdentifier(request)}`, 5, 10 * 60_000)) {
      return NextResponse.json(
        { error: "Too many application attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": "600", "Cache-Control": "no-store" } }
      );
    }

    const body = await readJsonBody(request, 24 * 1024);
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid startup application data." }, { status: 400 });
    }

    const allowedKeys = new Set<string>([...requiredTextFields, ...optionalTextFields, "teamSize", "websiteField", "consent", "customFields"]);
    if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
      return NextResponse.json({ error: "Unexpected application fields were provided." }, { status: 400 });
    }
    const configuredFields = (await getAsfTbiContent()).applicationForm.customFields;
    const customFieldResult = validateAsfTbiApplicationAnswers(configuredFields, body.customFields);
    if (!customFieldResult.valid) {
      return NextResponse.json({ error: customFieldResult.error }, { status: 400 });
    }
    if (body.websiteField !== undefined && typeof body.websiteField !== "string") {
      return NextResponse.json({ error: "The application could not be submitted." }, { status: 400 });
    }
    if (typeof body.websiteField === "string" && body.websiteField.trim()) {
      return NextResponse.json({ error: "The application could not be submitted." }, { status: 400 });
    }
    if (body.consent !== true) {
      return NextResponse.json({ error: "Please confirm that ASF-TBI may contact you about this application." }, { status: 400 });
    }

    const fields = Object.fromEntries(
      requiredTextFields.map((field) => [field, cleanText(body[field], field, true)])
    ) as Record<(typeof requiredTextFields)[number], string>;
    const optionalFields = Object.fromEntries(
      optionalTextFields.map((field) => [field, cleanText(body[field], field, false)])
    ) as Record<(typeof optionalTextFields)[number], string>;

    if (!startupStages.includes(fields.stage)) {
      return NextResponse.json({ error: "Please choose a valid startup stage." }, { status: 400 });
    }
    if (!startupIndustries.includes(fields.industry)) {
      return NextResponse.json({ error: "Please choose a valid industry." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || fields.email.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const phone = fields.phone.replace(/[\s().-]/g, "");
    if (!/^\+?[1-9]\d{7,14}$/.test(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number, including the country code." }, { status: 400 });
    }

    const teamSize = body.teamSize;
    if (typeof teamSize !== "number" || !Number.isInteger(teamSize) || teamSize < 1 || teamSize > 1_000) {
      return NextResponse.json({ error: "Team size must be a whole number between 1 and 1,000." }, { status: 400 });
    }

    if (!isSecureOptionalUrl(optionalFields.website) || !isSecureOptionalUrl(optionalFields.pitchDeckUrl)) {
      return NextResponse.json({ error: "Website and pitch deck links must be valid HTTPS URLs." }, { status: 400 });
    }

    const record: AsfTbiApplication = {
      id: `TBI-${crypto.randomUUID()}`,
      submittedAt: new Date().toISOString(),
      status: "new",
      ...fields,
      ...optionalFields,
      phone,
      teamSize,
      customFields: Object.fromEntries(configuredFields
        .filter((field) => field.enabled)
        .map((field) => [field.id, { label: field.label, value: customFieldResult.answers[field.id] }])),
    };

    const records = await getAsfTbiApplications();
    records.push(record);
    await saveAsfTbiApplications(records);

    return NextResponse.json(
      { success: true, applicationId: record.id },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("ASF-TBI startup application error:", error);
    return NextResponse.json(
      { error: "Could not submit the startup application. Please try again later." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
