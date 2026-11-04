import { NextRequest, NextResponse } from "next/server";
import {
  getAsfTbiApplications,
  isAsfTbiApplicationStatus,
  saveAsfTbiApplications,
} from "@/lib/asfTbiApplications";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";
import { recordAdminActivity } from "@/lib/adminActivity";
import { readJsonBody, RequestBodyError } from "@/lib/requestBody";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const statusNames: Record<string, string> = {
  submitted: "Submitted",
  "under-review": "Under Review",
  shortlisted: "Shortlisted",
  "interview-scheduled": "Interview Scheduled",
  approved: "Approved",
  rejected: "Rejected",
};

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
    if (!allowRequest(`admin-asf-tbi-application:${getClientIdentifier(request)}`, 60, 5 * 60_000)) {
      return NextResponse.json(
        { error: "Too many application updates. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": "300", "Cache-Control": "no-store" } }
      );
    }

    const body = await readJsonBody(request, 8 * 1024);
    if (
      !isRecord(body) ||
      typeof body.id !== "string" ||
      !body.id.trim() ||
      body.id.length > 100 ||
      Object.keys(body).some((key) => !["id", "status", "adminRemarks"].includes(key)) ||
      (body.status === undefined && body.adminRemarks === undefined) ||
      (body.status !== undefined && !isAsfTbiApplicationStatus(body.status)) ||
      (body.adminRemarks !== undefined && (
        typeof body.adminRemarks !== "string" || body.adminRemarks.length > 5_000
      ))
    ) {
      return NextResponse.json({ error: "A valid application update is required." }, { status: 400 });
    }

    const applications = await getAsfTbiApplications();
    const index = applications.findIndex((application) => application.id === body.id);
    if (index === -1) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const current = applications[index];
    const history = [...(current.history ?? [])];
    const changes: string[] = [];
    let updated = current;

    if (isAsfTbiApplicationStatus(body.status) && body.status !== current.status) {
      history.push({
        action: "status_changed",
        changedAt: new Date().toISOString(),
        previousStatus: current.status,
        status: body.status,
      });
      updated = { ...updated, status: body.status };
      changes.push(`Status changed to ${statusNames[body.status]}`);
    }

    if (typeof body.adminRemarks === "string") {
      const remarks = body.adminRemarks.trim();
      if (remarks.length > 5_000) {
        return NextResponse.json({ error: "Admin remarks must be 5,000 characters or fewer." }, { status: 400 });
      }
      if (remarks !== (current.adminRemarks ?? "")) {
        history.push({
          action: "remarks_updated",
          changedAt: new Date().toISOString(),
          remark: remarks,
        });
        updated = { ...updated, adminRemarks: remarks };
        changes.push("Admin remarks updated");
      }
    }

    if (changes.length === 0) {
      return NextResponse.json({ success: true, application: current });
    }

    applications[index] = { ...updated, history: history.slice(-200) };
    await saveAsfTbiApplications(applications);
    await recordAdminActivity({
      action: changes.join(" · "),
      entity: "Startup application",
      entityId: current.id,
    });
    return NextResponse.json(
      { success: true, application: applications[index] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin ASF-TBI applications PATCH error:", error);
    return NextResponse.json({ error: "Could not update the application." }, { status: 500 });
  }
}
