"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

type CourseDuration = { label: string; weeks: number; fee: number };
type Course = { id: string; name: string; durations: CourseDuration[] };

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `course-${Date.now()}`
  );
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/courses");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load courses.");
        setLoading(false);
        return;
      }
      setCourses(data.courses);
      setLoading(false);
    } catch {
      setError("Could not load courses.");
      setLoading(false);
    }
  }

  function updateCourseName(index: number, name: string) {
    setCourses((prev) => prev.map((c, i) => (i === index ? { ...c, name } : c)));
  }

  function addCourse() {
    setCourses((prev) => [
      ...prev,
      {
        id: slugify(`new-course-${prev.length + 1}`),
        name: "New Course",
        durations: [{ label: "2 Weeks", weeks: 2, fee: 2999 }],
      },
    ]);
  }

  function removeCourse(index: number) {
    if (courses.length <= 1) {
      setError("You need at least one course.");
      return;
    }
    if (!confirm(`Remove "${courses[index].name}"? This can't be undone once saved.`)) return;
    setCourses((prev) => prev.filter((_, i) => i !== index));
  }

  function addDuration(courseIndex: number) {
    setCourses((prev) =>
      prev.map((c, i) =>
        i === courseIndex
          ? { ...c, durations: [...c.durations, { label: "New Duration", weeks: 1, fee: 0 }] }
          : c
      )
    );
  }

  function updateDuration(
    courseIndex: number,
    durationIndex: number,
    patch: Partial<CourseDuration>
  ) {
    setCourses((prev) =>
      prev.map((c, i) =>
        i === courseIndex
          ? {
              ...c,
              durations: c.durations.map((d, j) => (j === durationIndex ? { ...d, ...patch } : d)),
            }
          : c
      )
    );
  }

  function removeDuration(courseIndex: number, durationIndex: number) {
    setCourses((prev) =>
      prev.map((c, i) => {
        if (i !== courseIndex) return c;
        if (c.durations.length <= 1) return c;
        return { ...c, durations: c.durations.filter((_, j) => j !== durationIndex) };
      })
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Re-derive slug ids from names for any newly added course whose id
      // still looks auto-generated, so URLs/ids stay readable.
      const finalCourses = courses.map((c) =>
        c.id.startsWith("new-course-") || c.id.startsWith("course-")
          ? { ...c, id: slugify(c.name) }
          : c
      );

      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: finalCourses }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save courses.");
        setSaving(false);
        return;
      }
      setCourses(data.courses);
      setSuccess("Saved. Changes are live on the registration form immediately.");
      setSaving(false);
    } catch {
      setError("Could not save courses.");
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Courses & Pricing</h1>
          <p style={styles.sub}>Edit course names, durations, and fees — no code changes needed.</p>
        </div>
        <Link href="/admin" style={styles.backLink}>
          ← Back to Registrations
        </Link>
      </header>

      {loading && <p style={styles.info}>Loading courses…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {success && <p style={styles.successText}>{success}</p>}

      {!loading && (
        <>
          <div style={styles.list}>
            {courses.map((course, ci) => (
              <div key={ci} style={styles.courseCard}>
                <div style={styles.courseHead}>
                  <input
                    value={course.name}
                    onChange={(e) => updateCourseName(ci, e.target.value)}
                    style={styles.courseNameInput}
                    placeholder="Course name"
                  />
                  <button
                    onClick={() => removeCourse(ci)}
                    style={styles.iconBtnDanger}
                    title="Remove course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={styles.durationsWrap}>
                  {course.durations.map((d, di) => (
                    <div key={di} style={styles.durationRow}>
                      <input
                        value={d.label}
                        onChange={(e) => updateDuration(ci, di, { label: e.target.value })}
                        placeholder="Label (e.g. 4 Weeks - Advance)"
                        style={styles.durationLabelInput}
                      />
                      <input
                        type="number"
                        min={0}
                        value={d.weeks}
                        onChange={(e) =>
                          updateDuration(ci, di, { weeks: Number(e.target.value) || 0 })
                        }
                        placeholder="Weeks"
                        style={styles.smallInput}
                      />
                      <span style={styles.unitLabel}>weeks</span>
                      <span style={styles.rupee}>₹</span>
                      <input
                        type="number"
                        min={0}
                        value={d.fee}
                        onChange={(e) =>
                          updateDuration(ci, di, { fee: Number(e.target.value) || 0 })
                        }
                        placeholder="Fee"
                        style={styles.smallInput}
                      />
                      <button
                        onClick={() => removeDuration(ci, di)}
                        style={styles.iconBtnDanger}
                        title="Remove duration"
                        disabled={course.durations.length <= 1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addDuration(ci)} style={styles.addDurationBtn}>
                    <Plus size={14} /> Add Duration
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button onClick={addCourse} style={styles.addCourseBtn}>
              <Plus size={16} /> Add Course
            </button>
            <button onClick={save} disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#faf8f5", fontFamily: "'DM Sans', sans-serif", padding: "32px 28px 60px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  h1: { margin: 0, fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: "#252525" },
  sub: { margin: "4px 0 0", fontSize: 13, color: "#777" },
  backLink: { fontSize: 13, fontWeight: 700, color: "#7b1e2b", textDecoration: "none" },
  info: { color: "#777", fontSize: 14 },
  errorText: { color: "#a33b49", fontSize: 14, padding: "10px 14px", background: "#fdecec", borderRadius: 8, marginBottom: 16 },
  successText: { color: "#2f8f4e", fontSize: 14, padding: "10px 14px", background: "#eaf6ed", borderRadius: 8, marginBottom: 16 },
  list: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 },
  courseCard: { background: "#fff", border: "1px solid #ded9d2", borderRadius: 14, padding: 20 },
  courseHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  courseNameInput: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ded9d2",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Manrope', sans-serif",
  },
  durationsWrap: { display: "flex", flexDirection: "column", gap: 8 },
  durationRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  durationLabelInput: { flex: "1 1 220px", padding: "9px 12px", border: "1px solid #ded9d2", borderRadius: 8, fontSize: 13 },
  smallInput: { width: 80, padding: "9px 10px", border: "1px solid #ded9d2", borderRadius: 8, fontSize: 13 },
  unitLabel: { fontSize: 12, color: "#777" },
  rupee: { fontSize: 13, fontWeight: 700, color: "#7b1e2b" },
  iconBtnDanger: {
    padding: 8,
    border: "1px solid #f0d4d4",
    borderRadius: 8,
    background: "#fdecec",
    color: "#a33b49",
    cursor: "pointer",
    display: "flex",
  },
  addDurationBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    padding: "8px 14px",
    border: "1px dashed #ded9d2",
    borderRadius: 8,
    background: "transparent",
    color: "#7b1e2b",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  actions: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  addCourseBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "11px 18px",
    border: "1px solid #ded9d2",
    borderRadius: 10,
    background: "#fff",
    color: "#4b4b4b",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "12px 26px",
    border: 0,
    borderRadius: 10,
    background: "#7b1e2b",
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
};
