import { NextResponse } from "next/server";
import { getFormFields } from "@/lib/formFields";

export async function GET() {
  const fields = await getFormFields();
  return NextResponse.json({ fields });
}