import { NextRequest, NextResponse } from "next/server";
import { getCourses, saveCourses, type Course } from "@/lib/courses";

export async function GET() {
  const courses = await getCourses();
  return NextResponse.json({ courses });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const courses = body?.courses;

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json({ error: "At least one course is required." }, { status: 400 });
    }

    if (
      courses.some(
        (course: Course) =>
          typeof course.id !== "string" ||
          typeof course.name !== "string" ||
          !Array.isArray(course.durations)
      )
    ) {
      return NextResponse.json({ error: "Invalid course data." }, { status: 400 });
    }

    await saveCourses(courses);
    return NextResponse.json({ success: true, courses });
  } catch (err) {
    console.error("admin courses PUT error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}