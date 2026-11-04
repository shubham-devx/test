import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";
import { recordAdminActivity } from "@/lib/adminActivity";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";

const DATA_FILE = path.join(process.cwd(), "data", "registrations.json");

type Registration = {
  registrationId: string;
  responses: Record<string, string>;
  course: string;
  duration: string;
  amount: number;
  paymentId: string;
  orderId: string;
  registeredAt: string;
  status?: string;
};

const VALID_STATUSES = ["new", "contacted", "enrolled", "not-interested"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readRegistrations(): Promise<Registration[]> {
  const records = await readJsonFile<unknown>(DATA_FILE, []);
  return Array.isArray(records) ? records as Registration[] : [];
}

async function writeRegistrations(records: Registration[]): Promise<void> {
  await writeJsonFile(DATA_FILE, records);
}

// Note: this route is already protected by proxy.ts (any request
// without a valid admin session cookie is rejected before it gets here).
export async function GET() {
  const records = await readRegistrations();
  const sorted = [...records].sort(
    (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
  );
  return NextResponse.json({ records: sorted });
}

export async function PATCH(req: NextRequest) {
  try {
    if (!allowRequest(`admin-registration-update:${getClientIdentifier(req)}`, 60, 5 * 60_000)) {
      return NextResponse.json(
        { error: "Too many registration updates. Please wait and try again." },
        { status: 429, headers: { "Retry-After": "300", "Cache-Control": "no-store" } }
      );
    }

    const body = await readJsonBody(req, 4 * 1024);
    if (
      !isRecord(body) ||
      typeof body.registrationId !== "string" ||
      !body.registrationId.trim() ||
      body.registrationId.length > 120 ||
      typeof body.status !== "string" ||
      !VALID_STATUSES.includes(body.status) ||
      Object.keys(body).some((key) => !["registrationId", "status"].includes(key))
    ) {
      return NextResponse.json({ error: "A valid registration ID and status are required." }, { status: 400 });
    }

    const records = await readRegistrations();
    const index = records.findIndex((r) => r.registrationId === body.registrationId);

    if (index === -1) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    records[index] = { ...records[index], status: body.status };
    await writeRegistrations(records);
    await recordAdminActivity({
      action: `Course registration marked ${body.status}`,
      entity: "Course registration",
      entityId: body.registrationId,
    });

    return NextResponse.json({ success: true, record: records[index] });
  } catch (err) {
    if (err instanceof RequestBodyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin registrations PATCH error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!allowRequest(`admin-registration-delete:${getClientIdentifier(req)}`, 20, 5 * 60_000)) {
      return NextResponse.json(
        { error: "Too many registration delete requests. Please wait and try again." },
        { status: 429, headers: { "Retry-After": "300", "Cache-Control": "no-store" } }
      );
    }

    const body = await readJsonBody(req, 2 * 1024);
    if (
      !isRecord(body) ||
      typeof body.registrationId !== "string" ||
      !body.registrationId.trim() ||
      body.registrationId.length > 120 ||
      Object.keys(body).some((key) => key !== "registrationId")
    ) {
      return NextResponse.json({ error: "A valid registration ID is required." }, { status: 400 });
    }

    const records = await readRegistrations();
    const nextRecords = records.filter((record) => record.registrationId !== body.registrationId);

    if (nextRecords.length === records.length) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    await writeRegistrations(nextRecords);
    await recordAdminActivity({
      action: "Course registration deleted",
      entity: "Course registration",
      entityId: body.registrationId,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof RequestBodyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("admin registrations DELETE error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}