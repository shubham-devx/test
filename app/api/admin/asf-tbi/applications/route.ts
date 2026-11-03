import { NextRequest, NextResponse } from "next/server";
import {
  getAsfTbiApplications,
  isAsfTbiApplicationStatus,
  saveAsfTbiApplications,
} from "@/lib/asfTbiApplications";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  try {
    const applications = await getAsfTbiApplications();
    applications.sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
    return NextResponse.json({ applications }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("admin ASF-TBI applications GET error:", error);
    return NextResponse.json({ error: "Could not load ASF-TBI applications." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await readJsonBody(request, 4 * 1024);
    if (!isRecord(body) || typeof body.id !== "string" || !isAsfTbiApplicationStatus(body.status)) {
      return NextResponse.json({ error: "A valid application ID and status are required." }, { status: 400 });
    }

    const applications = await getAsfTbiApplications();
    const index = applications.findIndex((application) => application.id === body.id);
    if (index === -1) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    applications[index] = { ...applications[index], status: body.status };
    await saveAsfTbiApplications(applications);
    return NextResponse.json({ success: true, application: applications[index] });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin ASF-TBI applications PATCH error:", error);
    return NextResponse.json({ error: "Could not update the application." }, { status: 500 });
  }
}
