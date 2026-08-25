"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import { COURSES, matchCourseByName } from "@/lib/courses";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type Step = "details" | "payment" | "success";

type FormState = {
  name: string;
  phone: string;
  designation: string;
  location: string;
  institution: string;
  dob: string;
  courseId: string;
  durationLabel: string;
};

type SuccessRecord = {
  registrationId: string;
  course: string;
  duration: string;
  amount: number;
  name: string;
};

function randomCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2; // 2-9
  const b = Math.floor(Math.random() * 8) + 1; // 1-8
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
  const defaultCourse = useMemo(
    () => matchCourseByName(initialCourseName),
    [initialCourseName]
  );

  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    designation: "",
    location: "",
    institution: "",
    dob: "",
    courseId: defaultCourse.id,
    durationLabel: defaultCourse.durations[0]?.label ?? "",
  });
  const [captcha, setCaptcha] = useState(randomCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successRecord, setSuccessRecord] = useState<SuccessRecord | null>(null);

  // Reset the whole form each time the modal is freshly opened.
  useEffect(() => {
    if (isOpen) {
      const course = matchCourseByName(initialCourseName);
      setStep("details");
      setForm({
        name: "",
        phone: "",
        designation: "",
        location: "",
        institution: "",
        dob: "",
        courseId: course.id,
        durationLabel: course.durations[0]?.label ?? "",
      });
      setCaptcha(randomCaptcha());
      setCaptchaInput("");
      setError("");
      setSuccessRecord(null);
    }
  }, [isOpen, initialCourseName]);

  if (!isOpen) return null;

  const selectedCourse = COURSES.find((c) => c.id === form.courseId) ?? COURSES[0];
  const selectedDuration =
    selectedCourse.durations.find((d) => d.label === form.durationLabel) ??
    selectedCourse.durations[0];

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCourseChange(courseId: string) {
    const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
    setForm((prev) => ({
      ...prev,
      courseId,
      durationLabel: course.durations[0]?.label ?? "",
    }));
  }

  function validateDetails(): string {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!/^\d{10}$/.test(form.phone.trim()))
      return "Please enter a valid 10-digit phone number.";
    if (!form.designation.trim()) return "Please enter your designation.";
    if (!form.location.trim()) return "Please enter your location.";
    if (!form.institution.trim()) return "Please enter your institution.";
    if (!form.dob) return "Please enter your date of birth.";
    if (!form.durationLabel) return "Please select a course duration.";
    if (Number(captchaInput) !== captcha.a + captcha.b)
      return "Captcha answer is incorrect.";
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
          courseId: form.courseId,
          durationLabel: form.durationLabel,
          name: form.name,
          phone: form.phone,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "Could not start payment. Please try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "AKGEC Skills Foundation",
        description: `${selectedCourse.name} - ${selectedDuration?.label ?? ""}`,
        prefill: {
          name: form.name,
          contact: form.phone,
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
                registrant: form,
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
              duration: selectedDuration?.label ?? "",
              amount: selectedDuration?.fee ?? 0,
              name: form.name,
            });
            setStep("success");
          } catch {
            setError("Payment succeeded but verification failed. Contact admin with your payment ID.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
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
        <button
          type="button"
          className="registration-close"
          onClick={handleClose}
          aria-label="Close registration"
        >
          <X size={20} />
        </button>

        <h2 id="registration-modal-title">
          Course <em>Registration</em>
        </h2>
        <p className="registration-intro">
          Fill in your details, review the fee for your selected course, and
          complete payment securely via UPI to confirm your seat.
        </p>

        <div className="registration-progress">
          <div className={step === "details" ? "active" : ""}>1. Details</div>
          <div className={step === "payment" ? "active" : ""}>2. Payment</div>
          <div className={step === "success" ? "active" : ""}>3. Confirmation</div>
        </div>

        {step === "details" && (
          <>
            <div className="registration-form">
              <div className="registration-field">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="registration-field">
                <label htmlFor="reg-phone">Phone Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="registration-field">
                <label htmlFor="reg-designation">Designation</label>
                <input
                  id="reg-designation"
                  type="text"
                  value={form.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  placeholder="e.g. Student, Engineer, Faculty"
                />
              </div>

              <div className="registration-field">
                <label htmlFor="reg-location">Location</label>
                <input
                  id="reg-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City / State"
                />
              </div>

              <div className="registration-field">
                <label htmlFor="reg-institution">Institution</label>
                <input
                  id="reg-institution"
                  type="text"
                  value={form.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  placeholder="College / Company name"
                />
              </div>

              <div className="registration-field">
                <label htmlFor="reg-dob">Date of Birth</label>
                <input
                  id="reg-dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                />
              </div>

              <div className="registration-field">
                <label htmlFor="reg-course">Course</label>
                <select
                  id="reg-course"
                  value={form.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  {COURSES.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="registration-field">
                <label htmlFor="reg-duration">Course Duration</label>
                <select
                  id="reg-duration"
                  value={form.durationLabel}
                  onChange={(e) => updateField("durationLabel", e.target.value)}
                >
                  {selectedCourse.durations.map((d) => (
                    <option key={d.label} value={d.label}>
                      {d.label} — ₹{d.fee.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="captcha-box" style={{ gridColumn: "1 / -1" }}>
                <div>
                  <span className="captcha-label">Security Check</span>
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
          </>
        )}

        {step === "payment" && selectedDuration && (
          <div className="payment-step">
            <div className="payment-summary-grid">
              <div>
                <span>Name</span>
                <strong>{form.name}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{form.phone}</strong>
              </div>
              <div>
                <span>Course</span>
                <strong>{selectedCourse.name}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{selectedDuration.label}</strong>
              </div>
              <div>
                <span>Institution</span>
                <strong>{form.institution}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{form.location}</strong>
              </div>
            </div>

            <div className="payment-amount-box">
              <span>Amount Payable</span>
              <strong>₹{selectedDuration.fee.toLocaleString("en-IN")}</strong>
              <p>You will be redirected to pay securely via UPI (any UPI app on your phone, or QR / collect request on desktop).</p>
            </div>

            {error && <div className="registration-error">{error}</div>}

            <p className="payment-note">
              Payments are processed by Razorpay and verified on our server before your seat is confirmed.
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
              <button
                type="button"
                className="registration-primary-button"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="spin" /> Processing...
                  </>
                ) : (
                  `Pay ₹${selectedDuration.fee.toLocaleString("en-IN")} via UPI`
                )}
              </button>
            </div>
          </div>
        )}

        {step === "success" && successRecord && (
          <div className="registration-success">
            <div className="registration-success-icon">
              <CheckCircle2 size={44} />
            </div>
            <h3>Payment Successful!</h3>
            <p>
              Thank you, {successRecord.name}. Your registration for{" "}
              {successRecord.course} has been confirmed. Please save your
              registration ID below — you&apos;ll need it for all future
              communication.
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
