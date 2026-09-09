"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type Step = "details" | "payment" | "success";

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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
    amount: number;
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
    setStep("payment");
  }

  async function handlePay() {
    if (!selectedCourse || !selectedDuration) return;
    setError("");
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError("Could not load the payment gateway. Check your internet connection.");
        setLoading(false);
        return;
      }

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          durationLabel: selectedDuration.label,
          responses,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "Could not start payment. Please try again.");
        setLoading(false);
        return;
      }

      const displayName =
        responses["name"] || Object.values(responses).find((v) => v?.trim()) || "there";

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "AKGEC Skills Foundation",
        description: `${selectedCourse.name} - ${selectedDuration.label}`,
        prefill: {
          name: responses["name"] || "",
          contact: responses["phone"] || "",
        },
        theme: { color: "#641c1c" },
        handler: async (response: unknown) => {
          const paymentResponse = response as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentResponse,
                courseId: selectedCourse.id,
                durationLabel: selectedDuration.label,
                responses,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setError(verifyData.error || "Payment could not be verified.");
              setLoading(false);
              return;
            }

            setSuccessRecord({
              registrationId: verifyData.registrationId,
              course: selectedCourse.name,
              duration: selectedDuration.label,
              amount: selectedDuration.fee,
              displayName,
            });
            setStep("success");
          } catch {
            setError(
              "Payment succeeded but verification failed. Contact admin with your payment ID."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed or was cancelled. Please try again.");
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
                {d.label} — ₹{d.fee.toLocaleString("en-IN")}
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
          Fill in your details, review the fee for your selected course, and complete payment
          securely to confirm your seat.
        </p>

        <div className="registration-progress">
          <div className={step === "details" ? "active" : ""}>1. Details</div>
          <div className={step === "payment" ? "active" : ""}>2. Payment</div>
          <div className={step === "success" ? "active" : ""}>3. Confirmation</div>
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
              <button type="button" className="registration-primary-button" onClick={handleContinue}>
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {!configLoading && step === "payment" && selectedCourse && selectedDuration && (
          <div className="payment-step">
            <div className="payment-summary-grid">
              {fields
                .filter((f) => !["course", "duration", "captcha"].includes(f.type))
                .filter((f) => responses[f.id]?.trim())
                .map((f) => (
                  <div key={f.id}>
                    <span>{f.label}</span>
                    <strong>{responses[f.id]}</strong>
                  </div>
                ))}
              <div>
                <span>Course</span>
                <strong>{selectedCourse.name}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{selectedDuration.label}</strong>
              </div>
            </div>

            <div className="payment-amount-box">
              <span>Amount Payable</span>
              <strong>₹{selectedDuration.fee.toLocaleString("en-IN")}</strong>
              <p>You'll be taken to a secure payment screen to complete your registration.</p>
            </div>

            {error && <div className="registration-error">{error}</div>}

            <p className="payment-note">
              Payments are processed by Razorpay and verified on our server before your seat is
              confirmed.
            </p>

            <div className="registration-form-actions">
              <button
                type="button"
                className="registration-cancel-button"
                onClick={() => setStep("details")}
                disabled={loading}
              >
                Back
              </button>
              <button type="button" className="registration-primary-button" onClick={handlePay} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={17} className="spin" /> Processing...
                  </>
                ) : (
                  `Pay ₹${selectedDuration.fee.toLocaleString("en-IN")}`
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
            <h3>Payment Successful!</h3>
            <p>
              Thank you, {successRecord.displayName}. Your registration for {successRecord.course}{" "}
              has been confirmed. Please save your registration ID below — you'll need it for all
              future communication.
            </p>

            <div className="registration-id-card">
              <span>Your Registration ID</span>
              <strong>{successRecord.registrationId}</strong>
              <small>A confirmation has been recorded with our team.</small>
            </div>

            <div className="registration-success-grid">
              <div>
                <span>Course</span>
                <strong>{successRecord.course}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{successRecord.duration}</strong>
              </div>
              <div>
                <span>Amount Paid</span>
                <strong>₹{successRecord.amount.toLocaleString("en-IN")}</strong>
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
