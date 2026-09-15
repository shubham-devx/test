"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";

type Step = "details" | "success";

type FieldType =
  | "text" | "tel" | "email" | "textarea" | "date" | "select"
  | "course" | "duration" | "captcha";

type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  locked?: boolean;
  options?: string[];
};

type CourseDuration = { label: string; weeks: number; fee: number };
type Course = { id: string; name: string; durations: CourseDuration[] };

function randomCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b };
}

export default function RegistrationModal({
  isOpen,
  initialCourseName,
  onClose,
}: {
  isOpen: boolean;
  initialCourseName?: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("details");
  const [configLoading, setConfigLoading] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [captcha, setCaptcha] = useState(randomCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successRecord, setSuccessRecord] = useState<{
    registrationId: string;
    course: string;
    duration: string;
    displayName: string;
  } | null>(null);

  const hasCaptchaField = fields.some((f) => f.type === "captcha");

  // Load current form config + courses fresh every time the modal opens,
  // and reset all state.
  useEffect(() => {
    if (!isOpen) return;

    setStep("details");
    setError("");
    setSuccessRecord(null);
    setCaptcha(randomCaptcha());
    setCaptchaInput("");
    setConfigLoading(true);

    Promise.all([
      fetch("/api/form-fields", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/courses", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([fieldsData, coursesData]) => {
        const loadedFields: FormField[] = fieldsData.fields ?? [];
        const loadedCourses: Course[] = coursesData.courses ?? [];
        setFields(loadedFields);
        setCourses(loadedCourses);

        const matched =
          loadedCourses.find(
            (c) => c.name.toLowerCase() === (initialCourseName || "").toLowerCase()
          ) ?? loadedCourses[0];

        const initial: Record<string, string> = {};
        for (const f of loadedFields) {
          if (f.type === "course") initial[f.id] = matched?.id ?? "";
          else if (f.type === "duration") initial[f.id] = matched?.durations[0]?.label ?? "";
          else initial[f.id] = "";
        }
        setResponses(initial);
        setConfigLoading(false);
      })
      .catch(() => {
        setError("Could not load the registration form. Please try again.");
        setConfigLoading(false);
      });
  }, [isOpen, initialCourseName]);

  if (!isOpen) return null;

  const courseField = fields.find((f) => f.type === "course");
  const durationField = fields.find((f) => f.type === "duration");
  const selectedCourse = courses.find((c) => c.id === responses[courseField?.id ?? "course"]);
  const selectedDuration = selectedCourse?.durations.find(
    (d) => d.label === responses[durationField?.id ?? "duration"]
  );

  function updateResponse(id: string, value: string) {
    setResponses((prev) => ({ ...prev, [id]: value }));
  }

  function handleCourseChange(fieldId: string, courseId: string) {
    const course = courses.find((c) => c.id === courseId);
    setResponses((prev) => ({
      ...prev,
      [fieldId]: courseId,
      ...(durationField ? { [durationField.id]: course?.durations[0]?.label ?? "" } : {}),
    }));
  }

  function validateDetails(): string {
    for (const f of fields) {
      if (f.type === "captcha") continue;
      const value = responses[f.id]?.trim() ?? "";
      if (f.required && !value) return `Please fill in "${f.label}".`;
      if (f.type === "tel" && value && !/^\d{10}$/.test(value)) {
        return `"${f.label}" must be a valid 10-digit phone number.`;
      }
      if (f.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
        return `"${f.label}" must be a valid email address.`;
      }
    }
    if (hasCaptchaField && Number(captchaInput) !== captcha.a + captcha.b) {
      return "Captcha answer is incorrect.";
    }
    if (!selectedCourse || !selectedDuration) {
      return "Please select a course and duration.";
    }
    return "";
  }

  function handleContinue() {
    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    handleRegister();
  }

  async function handleRegister() {
    if (!selectedCourse || !selectedDuration) return;
    setError("");
    setLoading(true);
    try {
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          durationLabel: selectedDuration.label,
          responses,
        }),
      });
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(registerData.error || "Could not submit your registration. Please try again.");
        setLoading(false);
        return;
      }

      const displayName =
        responses["name"] || Object.values(responses).find((v) => v?.trim()) || "there";

      setSuccessRecord({
        registrationId: registerData.registrationId,
        course: selectedCourse.name,
        duration: selectedDuration.label,
        displayName,
      });
      setStep("success");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while submitting your registration. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function renderField(f: FormField) {
    if (f.type === "course") {
      return (
        <div className="registration-field" key={f.id}>
          <label htmlFor={`reg-${f.id}`}>{f.label}</label>
          <select
            id={`reg-${f.id}`}
            value={responses[f.id] ?? ""}
            onChange={(e) => handleCourseChange(f.id, e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === "duration") {
      return (
        <div className="registration-field" key={f.id}>
          <label htmlFor={`reg-${f.id}`}>{f.label}</label>
          <select
            id={`reg-${f.id}`}
            value={responses[f.id] ?? ""}
            onChange={(e) => updateResponse(f.id, e.target.value)}
          >
            {selectedCourse?.durations.map((d) => (
              <option key={d.label} value={d.label}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === "captcha") {
      return (
        <div className="captcha-box" style={{ gridColumn: "1 / -1" }} key={f.id}>
          <div>
            <span className="captcha-label">{f.label || "Security Check"}</span>
            <strong>
              {captcha.a} + {captcha.b} = ?
            </strong>
          </div>
          <div>
            <span className="captcha-label">Your Answer</span>
            <input
              type="text"
              inputMode="numeric"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Sum"
            />
          </div>
          <button
            type="button"
            className="captcha-refresh"
            onClick={() => {
              setCaptcha(randomCaptcha());
              setCaptchaInput("");
            }}
            aria-label="Refresh captcha"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      );
    }

    if (f.type === "select") {
      return (
        <div className="registration-field" key={f.id}>
          <label htmlFor={`reg-${f.id}`}>{f.label}</label>
          <select
            id={`reg-${f.id}`}
            value={responses[f.id] ?? ""}
            onChange={(e) => updateResponse(f.id, e.target.value)}
          >
            <option value="">Select…</option>
            {(f.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === "textarea") {
      return (
        <div className="registration-field full" key={f.id}>
          <label htmlFor={`reg-${f.id}`}>{f.label}</label>
          <textarea
            id={`reg-${f.id}`}
            value={responses[f.id] ?? ""}
            onChange={(e) => updateResponse(f.id, e.target.value)}
            placeholder={f.placeholder}
            rows={3}
            style={{
              width: "100%",
              boxSizing: "border-box",
              font: "inherit",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              resize: "vertical",
            }}
          />
        </div>
      );
    }

    // text, tel, email, date
    return (
      <div className="registration-field" key={f.id}>
        <label htmlFor={`reg-${f.id}`}>{f.label}</label>
        <input
          id={`reg-${f.id}`}
          type={f.type}
          inputMode={f.type === "tel" ? "numeric" : undefined}
          maxLength={f.type === "tel" ? 10 : undefined}
          value={responses[f.id] ?? ""}
          onChange={(e) =>
            updateResponse(
              f.id,
              f.type === "tel" ? e.target.value.replace(/\D/g, "") : e.target.value
            )
          }
          placeholder={f.placeholder}
        />
      </div>
    );
  }

  function handleClose() {
    onClose();
  }

  return (
    <div className="registration-modal-backdrop" role="presentation" onClick={handleClose}>
      <div
        className="registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="registration-close" onClick={handleClose} aria-label="Close registration">
          <X size={20} />
        </button>

        <h2 id="registration-modal-title">
          Course <em>Registration</em>
        </h2>
        <p className="registration-intro">
          Fill in your details to register for a course. After registration, visit the ASF office
          to complete the enrolment process.
        </p>

        <div className="registration-progress">
          <div className={step === "details" ? "active" : ""}>1. Details</div>
          <div className={step === "success" ? "active" : ""}>2. Confirmation</div>
        </div>

        {configLoading && <p style={{ padding: "20px 0" }}>Loading form…</p>}

        {!configLoading && step === "details" && (
          <div className="registration-form">
            {fields.map(renderField)}

            {error && <div className="registration-error full">{error}</div>}

            <div className="registration-form-actions full">
              <button type="button" className="registration-cancel-button" onClick={handleClose}>
                Cancel
              </button>
              <button type="button" className="registration-primary-button" onClick={handleContinue} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={17} className="spin" /> Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </button>
            </div>
          </div>
        )}

        {!configLoading && step === "success" && successRecord && (
          <div className="registration-success">
            <div className="registration-success-icon">
              <CheckCircle2 size={44} />
            </div>
            <h3>Registration Successful!</h3>
            <p>
              Thank you, {successRecord.displayName}. You have successfully registered for{" "}
              {successRecord.course}. Please visit the ASF office to continue your learning. Save
              your registration ID for future communication.
            </p>

            <div className="registration-id-card">
              <span>Your Registration ID</span>
              <strong>{successRecord.registrationId}</strong>
              <small>A confirmation has been recorded with our team.</small>
            </div>

            <div className="registration-success-grid registration-success-grid-compact">
              <div>
                <span>Course</span>
                <strong>{successRecord.course}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{successRecord.duration}</strong>
              </div>
            </div>

            <button type="button" className="registration-primary-button" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
