"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, X } from "lucide-react";
import type { AsfTbiContent } from "@/lib/asfTbiContent";

type Props = {
  open: boolean;
  email: string;
  fields: AsfTbiContent["applicationForm"]["customFields"];
  onClose: () => void;
};

const initialForm = {
  founderName: "",
  email: "",
  phone: "",
  startupName: "",
  website: "",
  stage: "",
  industry: "",
  city: "",
  teamSize: "1",
  problem: "",
  solution: "",
  description: "",
  traction: "",
  supportNeeds: "",
  pitchDeckUrl: "",
  websiteField: "",
  consent: false,
};

export default function AsfTbiApplicationModal({ open, email, fields, onClose }: Props) {
  const [form, setForm] = useState(initialForm);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    if (applicationId) successRef.current?.focus();
  }, [applicationId]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("input:not([tabindex='-1']),select,textarea,button")?.focus();
    }, 0);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submittingRef.current) {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]),input:not([disabled]):not([tabindex='-1']),select:not([disabled]),textarea:not([disabled]),a[href]"
      ) ?? []).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  function updateField(key: keyof typeof initialForm, value: string | boolean) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/asf-tbi/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teamSize: Number(form.teamSize), customFields: customValues }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit your application.");
      setApplicationId(result.applicationId);
      setForm(initialForm);
      setCustomValues({});
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="tbi-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <section ref={dialogRef} className="tbi-application-modal" role="dialog" aria-modal="true" aria-labelledby="tbi-application-title" tabIndex={-1}>
        <button className="tbi-modal-close" type="button" aria-label="Close application form" onClick={onClose} disabled={submitting}><X size={21} /></button>
        {applicationId ? (
          <div ref={successRef} className="tbi-application-success" tabIndex={-1}>
            <CheckCircle2 size={48} />
            <span className="tbi-eyebrow">Application received</span>
            <h2 id="tbi-application-title">Thank you for sharing your idea.</h2>
            <p>Your startup application is safely recorded for the ASF-TBI team. Keep this reference for your records.</p>
            <strong>{applicationId}</strong>
            <a href={`mailto:${email}?subject=${encodeURIComponent(`Startup application ${applicationId}`)}`}>Contact the incubation team</a>
            <button type="button" className="tbi-button tbi-button-primary" onClick={() => { setApplicationId(""); onClose(); }}>Done <ArrowRight size={16} /></button>
          </div>
        ) : (
          <>
            <div className="tbi-modal-heading">
              <span className="tbi-eyebrow">ASF-TBI startup application</span>
              <h2 id="tbi-application-title">Tell us what you’re building.</h2>
              <p>Share a few details so our incubation team can understand your idea and follow up.</p>
            </div>
            <form className="tbi-application-form" onSubmit={(event) => void submitApplication(event)}>
              <div className="tbi-form-group">
                <h3><span>01</span> Founder & venture</h3>
                <div className="tbi-form-grid">
                  <label>Founder name<input required maxLength={200} autoComplete="name" value={form.founderName} onChange={(event) => updateField("founderName", event.target.value)} placeholder="Your full name" /></label>
                  <label>Startup name<input required maxLength={200} value={form.startupName} onChange={(event) => updateField("startupName", event.target.value)} placeholder="Venture or working title" /></label>
                  <label>Email address<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" /></label>
                  <label>Phone number<input required type="tel" maxLength={22} autoComplete="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+91 98765 43210" /></label>
                  <label>City<input required maxLength={120} autoComplete="address-level2" value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Where is your team based?" /></label>
                  <label>Team size<input required type="number" min={1} max={1000} value={form.teamSize} onChange={(event) => updateField("teamSize", event.target.value)} /></label>
                  <label>Startup stage<select required value={form.stage} onChange={(event) => updateField("stage", event.target.value)}><option value="">Select stage</option><option>Idea</option><option>Validation</option><option>Prototype</option><option>MVP</option><option>Early revenue</option><option>Scaling</option></select></label>
                  <label>Industry<select required value={form.industry} onChange={(event) => updateField("industry", event.target.value)}><option value="">Select industry</option><option>Artificial intelligence</option><option>Aerospace & defence</option><option>Clean energy & climate</option><option>Education</option><option>Healthcare</option><option>Manufacturing</option><option>Agriculture</option><option>Mobility</option><option>Other</option></select></label>
                  <label className="tbi-form-field-wide">Website or product link <span>Optional · HTTPS link only</span><input type="url" maxLength={500} value={form.website} onChange={(event) => updateField("website", event.target.value)} placeholder="https://example.com" /></label>
                </div>
              </div>

              {fields.some((field) => field.enabled) && <div className="tbi-form-group">
                <h3><span>03</span> Additional details</h3>
                <div className="tbi-form-grid">
                  {fields.filter((field) => field.enabled).map((field) => (
                    <label className="tbi-form-field-wide" key={field.id}>
                      {field.label}{!field.required && <span>Optional</span>}
                      {field.type === "textarea" ? (
                        <textarea required={field.required} maxLength={2000} rows={3} value={customValues[field.id] ?? ""} placeholder={field.placeholder} onChange={(event) => setCustomValues((previous) => ({ ...previous, [field.id]: event.target.value }))} />
                      ) : field.type === "select" ? (
                        <select required={field.required} value={customValues[field.id] ?? ""} onChange={(event) => setCustomValues((previous) => ({ ...previous, [field.id]: event.target.value }))}>
                          <option value="">{field.placeholder || "Select an option"}</option>
                          {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : (
                        <input required={field.required} type={field.type === "url" ? "url" : "text"} maxLength={500} value={customValues[field.id] ?? ""} placeholder={field.placeholder} onChange={(event) => setCustomValues((previous) => ({ ...previous, [field.id]: event.target.value }))} />
                      )}
                    </label>
                  ))}
                </div>
              </div>}

              <div className="tbi-form-group">
                <h3><span>02</span> The opportunity</h3>
                <div className="tbi-form-grid">
                  <label className="tbi-form-field-wide">What problem are you solving?<textarea required maxLength={2000} rows={3} value={form.problem} onChange={(event) => updateField("problem", event.target.value)} placeholder="Who experiences this problem, and why does it matter?" /></label>
                  <label className="tbi-form-field-wide">How does your solution help?<textarea required maxLength={2000} rows={3} value={form.solution} onChange={(event) => updateField("solution", event.target.value)} placeholder="Describe your proposed product, service or technology." /></label>
                  <label className="tbi-form-field-wide">What makes your approach distinctive?<textarea required maxLength={2000} rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Tell us what is different about your approach." /></label>
                  <label className="tbi-form-field-wide">Progress or validation so far <span>Optional</span><textarea maxLength={2000} rows={2} value={form.traction} onChange={(event) => updateField("traction", event.target.value)} placeholder="Interviews, prototype, pilots, early customers or other progress." /></label>
                  <label className="tbi-form-field-wide">What support would help you most?<textarea required maxLength={2000} rows={3} value={form.supportNeeds} onChange={(event) => updateField("supportNeeds", event.target.value)} placeholder="For example: mentoring, prototyping, workspace, industry connections." /></label>
                  <label className="tbi-form-field-wide">Pitch deck link <span>Optional · HTTPS link only</span><input type="url" maxLength={500} value={form.pitchDeckUrl} onChange={(event) => updateField("pitchDeckUrl", event.target.value)} placeholder="https://..." /></label>
                </div>
              </div>

              <label className="tbi-form-honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.websiteField} onChange={(event) => updateField("websiteField", event.target.value)} /></label>
              <label className="tbi-application-consent"><input type="checkbox" required checked={form.consent} onChange={(event) => updateField("consent", event.target.checked)} /><span>I agree that ASF-TBI may use these details to review my application and contact me about the incubation process. My application is only available to authorized administrators.</span></label>
              {error && <p className="tbi-application-error" role="alert">{error}</p>}
              <div className="tbi-application-submit"><p>Submitting an application does not guarantee selection, incubation or funding.</p><button className="tbi-button tbi-button-primary" type="submit" disabled={submitting}>{submitting ? <><LoaderCircle className="tbi-loader" size={16} /> Submitting…</> : <>Submit application <ArrowRight size={16} /></>}</button></div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
