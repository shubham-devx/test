import { NextRequest, NextResponse } from "next/server";
import { getFormFields, saveFormFields, type FormField } from "@/lib/formFields";

export async function GET() {
  const fields = await getFormFields();
  return NextResponse.json({ fields });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const fields = body?.fields;

    if (!Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: "At least one form field is required." }, { status: 400 });
    }

    if (
      fields.some(
        (field: FormField) =>
          typeof field.id !== "string" ||
          typeof field.type !== "string" ||
          typeof field.label !== "string" ||
          typeof field.required !== "boolean"
      )
    ) {
      return NextResponse.json({ error: "Invalid form field data." }, { status: 400 });
    }

    await saveFormFields(fields);
    return NextResponse.json({ success: true, fields });
  } catch (err) {
    console.error("admin form-fields PUT error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}