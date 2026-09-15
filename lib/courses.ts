import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/persistentData";

export type CourseDuration = {
  label: string;
  weeks: number;
  fee: number; // INR
};

export type Course = {
  id: string;
  name: string;
  durations: CourseDuration[];
};

const DATA_FILE = path.join(process.cwd(), "data", "courses.json");

const DEFAULT_COURSES: Course[] = [
  {
    id: "industrial-robotics",
    name: "Industrial Robotics",
    durations: [
      { label: "2 Weeks - Basic", weeks: 2, fee: 2999 },
      { label: "4 Weeks - Advance", weeks: 4, fee: 5999 },
      { label: "8 Weeks - Expert", weeks: 8, fee: 9999 },
    ],
  },
  {
    id: "automation-control",
    name: "Automation & Control",
    durations: [
      { label: "2 Weeks - Basic", weeks: 2, fee: 2999 },
      { label: "4 Weeks - Advance", weeks: 4, fee: 5999 },
      { label: "8 Weeks - Expert", weeks: 8, fee: 9999 },
    ],
  },
  {
    id: "advanced-manufacturing",
    name: "Advanced Manufacturing",
    durations: [
      { label: "2 Weeks - Basic", weeks: 2, fee: 3499 },
      { label: "4 Weeks - Advance", weeks: 4, fee: 6499 },
    ],
  },
  {
    id: "welding-metrology-drone",
    name: "Welding, Metrology & Drone",
    durations: [
      { label: "2 Weeks - Basic", weeks: 2, fee: 3999 },
      { label: "4 Weeks - Advance", weeks: 4, fee: 7499 },
    ],
  },
  {
    id: "general",
    name: "General Enquiry / Other Programme",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
];

export async function getCourses(): Promise<Course[]> {
  const courses = await readJsonFile<unknown>(DATA_FILE, null);
  return Array.isArray(courses) && courses.length ? courses as Course[] : DEFAULT_COURSES;
}

export async function saveCourses(courses: Course[]): Promise<void> {
  await writeJsonFile(DATA_FILE, courses);
}

export async function findCourse(courseId: string): Promise<Course | undefined> {
  const courses = await getCourses();
  return courses.find((c) => c.id === courseId);
}

export async function findDuration(
  courseId: string,
  durationLabel: string
): Promise<CourseDuration | undefined> {
  const course = await findCourse(courseId);
  return course?.durations.find((d) => d.label === durationLabel);
}