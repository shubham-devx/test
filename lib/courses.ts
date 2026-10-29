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
const CATALOG_VERSION_FILE = path.join(process.cwd(), "data", "course-catalog-version.json");
const CATALOG_VERSION = 1;
const CATALOG_ADDITION_IDS = new Set([
  "akgec-kuka-centre",
  "akgec-ni-labview-academy",
  "akgec-bosch-ceat",
  "aia-cia",
  "awtrc",
  "amc",
  "bosch-jcc",
  "akgec-fronius",
  "akgec-siemens-plm",
  "akgec-siemens-coe",
  "akgec-fablab",
  "cfc-afipd",
]);

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
  {
    id: "akgec-kuka-centre",
    name: "AKGEC-KUKA Centre",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "akgec-ni-labview-academy",
    name: "AKGEC-NI LabVIEW Academy",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "akgec-bosch-ceat",
    name: "AKGEC-BOSCH CEAT",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "aia-cia",
    name: "AIA-CIA",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "awtrc",
    name: "AWTRC",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "amc",
    name: "AMC",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "bosch-jcc",
    name: "BOSCH JCC",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "akgec-fronius",
    name: "AKGEC-FRONIUS",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "akgec-siemens-plm",
    name: "AKGEC-SIEMENS PLM",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "akgec-siemens-coe",
    name: "AKGEC-SIEMENS COE",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "akgec-fablab",
    name: "AKGEC-FABLAB",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
  {
    id: "cfc-afipd",
    name: "CFC-AFIPD",
    durations: [
      { label: "2 Weeks", weeks: 2, fee: 2499 },
      { label: "4 Weeks", weeks: 4, fee: 4999 },
    ],
  },
];

export async function getCourses(): Promise<Course[]> {
  const courses = await readJsonFile<unknown>(DATA_FILE, null);
  if (!Array.isArray(courses) || !courses.length) return DEFAULT_COURSES;

  const catalogVersion = await readJsonFile<number>(CATALOG_VERSION_FILE, 0);
  if (catalogVersion < CATALOG_VERSION) {
    const existingIds = new Set(
      courses
        .filter(
          (course): course is Course =>
            Boolean(course) && typeof course === "object" && "id" in course
        )
        .map((course) => course.id)
    );
    const updatedCourses = [
      ...courses,
      ...DEFAULT_COURSES.filter(
        (course) => CATALOG_ADDITION_IDS.has(course.id) && !existingIds.has(course.id)
      ),
    ] as Course[];
    await writeJsonFile(DATA_FILE, updatedCourses);
    await writeJsonFile(CATALOG_VERSION_FILE, CATALOG_VERSION);
    return updatedCourses;
  }

  return courses as Course[];
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