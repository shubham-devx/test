import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

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
  const fields = await readJsonFile<unknown>(FIELDS_FILE, null);
  return Array.isArray(fields) && fields.length ? fields as FormField[] : FALLBACK_FIELDS;
}

export async function saveFormFields(fields: FormField[]): Promise<void> {
  await writeJsonFile(FIELDS_FILE, fields);
}