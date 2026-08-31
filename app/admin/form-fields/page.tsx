"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowUp, ArrowDown, Lock } from "lucide-react";

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

const ADDABLE_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "tel", label: "Phone Number" },
  { value: "email", label: "Email" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown (custom options)" },
];

function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `field-${Date.now()}`
  );
}

export default function AdminFormFieldsPage() {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newType, setNewType] = useState<FieldType>("text");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/form-fields");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load the form.");
        setLoading(false);
        return;
      }
      setFields(data.fields);
      setLoading(false);
    } catch {
      setError("Could not load the form.");
      setLoading(false);
    }
  }

  function updateField(index: number, patch: Partial<FormField>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    const f = fields[index];
    if (f.locked) return; // course/duration can't be removed
    if (!confirm(`Remove "${f.label}" from the form?`)) return;
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addField() {
    const label = "New Field";
    setFields((prev) => [
      ...prev,
      {
        id: slugify(`${label}-${prev.length + 1}`),
        type: newType,
        label,
        placeholder: "",
        required: true,
        locked: false,
        options: newType === "select" ? ["Option 1", "Option 2"] : [],
      },
    ]);
  }

  function updateOption(fieldIndex: number, optIndex: number, value: string) {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex
          ? { ...f, options: (f.options ?? []).map((o, j) => (j === optIndex ? value : o)) }
          : f
      )
    );
  }

  function addOption(fieldIndex: number) {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex ? { ...f, options: [...(f.options ?? []), "New Option"] } : f
      )
    );
  }

  function removeOption(fieldIndex: number, optIndex: number) {
    setFields((prev) =>
      prev.map((f, i) =>
        i === fieldIndex ? { ...f, options: (f.options ?? []).filter((_, j) => j !== optIndex) } : f
      )
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const finalFields = fields.map((f) =>
        f.id.startsWith("field-") ? { ...f, id: slugify(f.label) } : f
      );

      const res = await fetch("/api/admin/form-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: finalFields }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save the form.");
        setSaving(false);
        return;
      }
      setFields(data.fields);
      setSuccess("Saved. The registration form updates immediately — no code changes needed.");
      setSaving(false);
    } catch {
      setError("Could not save the form.");
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Form Builder</h1>
          <p style={styles.sub}>
            Add, remove, reorder, or relabel any field on the registration form.
          </p>
        </div>
        <Link href="/admin" style={styles.backLink}>
          ← Back to Registrations
        </Link>
      </header>

      {loading && <p style={styles.info}>Loading form…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {success && <p style={styles.successText}>{success}</p>}

      {!loading && (
        <>
          <div style={styles.list}>
            {fields.map((f, i) => (
              <div key={i} style={styles.fieldCard}>
                <div style={styles.fieldRow}>
                  <div style={styles.orderButtons}>
                    <button onClick={() => moveField(i, -1)} disabled={i === 0} style={styles.iconBtn} title="Move up">
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveField(i, 1)}
                      disabled={i === fields.length - 1}
                      style={styles.iconBtn}
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <input
                    value={f.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    style={styles.labelInput}
                    placeholder="Field label"
                  />

                  <span style={styles.typeBadge}>
                    {f.locked && <Lock size={11} style={{ marginRight: 4 }} />}
                    {f.type === "course" ? "Course (built-in)" :
                     f.type === "duration" ? "Duration (built-in)" :
                     f.type === "captcha" ? "Captcha" :
                     ADDABLE_TYPES.find((t) => t.value === f.type)?.label ?? f.type}
                  </span>

                  <label style={styles.requiredLabel}>
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) => updateField(i, { required: e.target.checked })}
                      disabled={f.type === "captcha"}
                    />
                    Required
                  </label>

                  <button
                    onClick={() => removeField(i)}
                    disabled={f.locked}
                    style={{ ...styles.iconBtnDanger, opacity: f.locked ? 0.35 : 1 }}
                    title={f.locked ? "This field is required for payment and can't be removed" : "Remove field"}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {["text", "tel", "email", "textarea", "date"].includes(f.type) && (
                  <input
                    value={f.placeholder ?? ""}
                    onChange={(e) => updateField(i, { placeholder: e.target.value })}
                    placeholder="Placeholder text shown inside the input (optional)"
                    style={styles.placeholderInput}
                  />
                )}

                {f.type === "select" && (
                  <div style={styles.optionsWrap}>
                    <span style={styles.optionsLabel}>Dropdown options:</span>
                    {(f.options ?? []).map((opt, oi) => (
                      <div key={oi} style={styles.optionRow}>
                        <input
                          value={opt}
                          onChange={(e) => updateOption(i, oi, e.target.value)}
                          style={styles.optionInput}
                        />
                        <button onClick={() => removeOption(i, oi)} style={styles.iconBtnDanger} title="Remove option">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addOption(i)} style={styles.addOptionBtn}>
                      <Plus size={12} /> Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={styles.addFieldBar}>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as FieldType)}
              style={styles.typeSelect}
            >
              {ADDABLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button onClick={addField} style={styles.addFieldBtn}>
              <Plus size={16} /> Add Field
            </button>
          </div>

          <div style={styles.actions}>
            <p style={styles.hint}>
              Course and Duration fields are locked — the payment flow depends on them — but you
              can still relabel them.
            </p>
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
  list: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 },
  fieldCard: { background: "#fff", border: "1px solid #ded9d2", borderRadius: 12, padding: 14 },
  fieldRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  orderButtons: { display: "flex", flexDirection: "column", gap: 2 },
  iconBtn: { padding: 4, border: "1px solid #ded9d2", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex" },
  labelInput: { flex: "1 1 180px", padding: "9px 12px", border: "1px solid #ded9d2", borderRadius: 8, fontSize: 14, fontWeight: 600 },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 10px",
    borderRadius: 999,
    background: "#f3eee8",
    color: "#7b1e2b",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  requiredLabel: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#4b4b4b", whiteSpace: "nowrap" },
  iconBtnDanger: {
    padding: 7,
    border: "1px solid #f0d4d4",
    borderRadius: 8,
    background: "#fdecec",
    color: "#a33b49",
    cursor: "pointer",
    display: "flex",
  },
  placeholderInput: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 8,
    padding: "8px 12px",
    border: "1px solid #eee9e3",
    borderRadius: 8,
    fontSize: 12,
    color: "#777",
  },
  optionsWrap: { marginTop: 10, paddingTop: 10, borderTop: "1px solid #eee9e3", display: "flex", flexDirection: "column", gap: 6 },
  optionsLabel: { fontSize: 11, fontWeight: 700, color: "#777" },
  optionRow: { display: "flex", gap: 6, alignItems: "center" },
  optionInput: { flex: 1, padding: "7px 10px", border: "1px solid #ded9d2", borderRadius: 6, fontSize: 12 },
  addOptionBtn: {
    display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
    padding: "6px 10px", border: "1px dashed #ded9d2", borderRadius: 6, background: "transparent",
    color: "#7b1e2b", fontSize: 11, fontWeight: 700, cursor: "pointer",
  },
  addFieldBar: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" },
  typeSelect: { padding: "10px 14px", border: "1px solid #ded9d2", borderRadius: 10, fontSize: 13, background: "#fff" },
  addFieldBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 18px", border: "1px solid #ded9d2", borderRadius: 10, background: "#fff",
    color: "#4b4b4b", fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  actions: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  hint: { fontSize: 12, color: "#999", maxWidth: 460, margin: 0 },
  saveBtn: {
    padding: "12px 26px", border: 0, borderRadius: 10, background: "#7b1e2b",
    color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer",
  },
};
