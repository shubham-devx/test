import { promises as fs } from "fs";
import path from "path";

const FIELDS_FILE = path.join(process.cwd(), "data", "form-fields.json");

export type FieldType =
  | "text"
  | "tel"
  | "email"
  | "textarea"
  | "date"
  | "select"
  | "course"
  | "duration"
  | "captcha";

export type FormField = {
  id: string; // stable key the answer is stored under. Fixed to the type name for course/duration/captcha.
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  locked?: boolean; // locked fields (course, duration) can be relabeled but not deleted
  options?: string[]; // for type: "select"
};

const FALLBACK_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "Full Name", placeholder: "Enter your full name", required: true, locked: false, options: [] },
  { id: "course", type: "course", label: "Course", required: true, locked: true, options: [] },
  { id: "duration", type: "duration", label: "Course Duration", required: true, locked: true, options: [] },
];

export async function getFormFields(): Promise<FormField[]> {
  try {
    const raw = await fs.readFile(FIELDS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_FIELDS;
  } catch {
    return FALLBACK_FIELDS;
  }
}

export async function saveFormFields(fields: FormField[]): Promise<void> {
  await fs.mkdir(path.dirname(FIELDS_FILE), { recursive: true });
  await fs.writeFile(FIELDS_FILE, JSON.stringify(fields, null, 2), "utf-8");
}