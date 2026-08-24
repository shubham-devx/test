/**
 * Single source of truth for courses, durations and fees.
 *
 * IMPORTANT: The server (app/api/create-order, app/api/verify-payment) reads
 * the fee from THIS file, never from anything the browser sends. That is
 * what stops someone from editing the page in devtools and "paying" ₹1 for
 * a ₹9,999 course.
 */

export type CourseDuration = {
  label: string;
  weeks: number;
  fee: number; // in rupees (INR)
};

export type Course = {
  id: string;
  name: string;
  durations: CourseDuration[];
};

export const COURSES: Course[] = [
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

export function findCourse(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

export function findDuration(
  courseId: string,
  durationLabel: string
): CourseDuration | undefined {
  return findCourse(courseId)?.durations.find((d) => d.label === durationLabel);
}

/** Used by the page to pre-select a course when the user clicks a specific
 * "Register" button (e.g. from the training-programme cards). Falls back to
 * the first course (General Enquiry) if there's no exact name match. */
export function matchCourseByName(name?: string): Course {
  if (!name) return COURSES[0];
  return COURSES.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? COURSES[0];
}