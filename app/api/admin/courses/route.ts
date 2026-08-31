import { NextResponse } from "next/server";
import { getCourses } from "@/lib/courses";

export async function GET() {
  const courses = await getCourses();
  return NextResponse.json({ courses });
}