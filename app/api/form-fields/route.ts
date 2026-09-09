import { NextResponse } from "next/server";
import { getFormFields } from "@/lib/formFields";

export const dynamic = "force-dynamic";

export async function GET() {
  const fields = await getFormFields();
  return NextResponse.json({ fields }, {
    headers: { "Cache-Control": "no-store" },
  });
}
