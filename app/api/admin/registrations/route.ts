import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

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
    const { registrationId, status } = await req.json();

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: "registrationId and status are required." },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const records = await readRegistrations();
    const index = records.findIndex((r) => r.registrationId === registrationId);

    if (index === -1) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    records[index] = { ...records[index], status };
    await writeRegistrations(records);

    return NextResponse.json({ success: true, record: records[index] });
  } catch (err) {
    console.error("admin registrations PATCH error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (typeof registrationId !== "string" || !registrationId.trim()) {
      return NextResponse.json({ error: "registrationId is required." }, { status: 400 });
    }

    const records = await readRegistrations();
    const nextRecords = records.filter((record) => record.registrationId !== registrationId);

    if (nextRecords.length === records.length) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    await writeRegistrations(nextRecords);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("admin registrations DELETE error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}