"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Loader2, X } from "lucide-react";

type CourseDuration = { label: string; weeks: number; fee: number };
type Course = { id: string; name: string; durations: CourseDuration[] };

export default function CourseFeesModal({
  isOpen,
  onClose,
  onRegister,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (courseName: string) => void;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/courses", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load courses.");
        setCourses(data.courses ?? []);
      })
      .catch(() => setError("Could not load the course list. Please try again."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="course-fees-backdrop" role="presentation" onClick={onClose}>
      <div
        className="course-fees-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-fees-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="centre-modal-close" onClick={onClose} aria-label="Close courses and fees">
          <X size={22} />
        </button>

        <span className="section-label">COURSE CATALOGUE</span>
        <h2 id="course-fees-title">Courses <em>& fees.</em></h2>
        <p className="course-fees-intro">
          Explore available programmes and durations. Fees are shown in INR and can be updated by
          the ASF administration team.
        </p>

        {loading && (
          <div className="course-fees-state">
            <Loader2 size={20} className="spin" /> Loading courses...
          </div>
        )}
        {error && <p className="course-fees-error">{error}</p>}

        {!loading && !error && (
          <div className="course-fees-list">
            {courses.map((course) => (
              <article className="course-fees-card" key={course.id}>
                <div className="course-fees-card-head">
                  <h3>{course.name}</h3>
                  <button type="button" className="course-fees-register" onClick={() => onRegister(course.name)}>
                    Register <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="course-fees-options">
                  {course.durations.map((duration) => (
                    <div className="course-fees-option" key={duration.label}>
                      <span>{duration.label}</span>
                      <strong>₹{duration.fee.toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="course-fees-footer">
          <span>Pay the course fee at the ASF office after registration.</span>
          <button type="button" className="modal-close-text" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}