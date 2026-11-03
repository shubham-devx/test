"use client";

import "./admin-asf-tbi.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import defaultContent from "@/data/asf-tbi-content.json";
import type { AsfTbiContent } from "@/lib/asfTbiContent";

type PathPart = string | number;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readAtPath(root: unknown, path: PathPart[]): unknown {
  let value = root;
  for (const key of path) {
    if (typeof key === "number" && Array.isArray(value)) value = value[key];
    else if (typeof key === "string" && isRecord(value)) value = value[key];
    else return undefined;
  }
  return value;
}

function writeAtPath(
  root: unknown,
  path: PathPart[],
  nextValue: unknown,
  remove = false
): void {
  if (path.length === 0) return;
  let parent = root;
  for (const key of path.slice(0, -1)) {
    if (typeof key === "number" && Array.isArray(parent)) parent = parent[key];
    else if (typeof key === "string" && isRecord(parent)) parent = parent[key];
    else return;
  }

  const key = path[path.length - 1];
  if (typeof key === "number" && Array.isArray(parent)) {
    if (remove) parent.splice(key, 1);
    else parent[key] = nextValue;
  } else if (typeof key === "string" && isRecord(parent)) {
    if (remove) delete parent[key];
    else parent[key] = nextValue;
  }
}

function emptyLike(value: unknown): unknown {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyLike(child)]));
  }
  return null;
}

function newCollectionItem(path: PathPart[], value: unknown, existing: unknown[]): unknown {
  if (path.join(".") !== "applicationForm.customFields") return emptyLike(value);
  const ids = new Set(existing.filter(isRecord).map((field) => field.id));
  let suffix = 1;
  let id = "custom-question";
  while (ids.has(id)) {
    suffix += 1;
    id = `custom-question-${suffix}`;
  }
  return {
    id,
    label: "Additional question",
    type: "textarea",
    enabled: true,
    required: false,
    placeholder: "Your response",
    options: [],
  };
}

function fieldLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function itemTitle(value: unknown, index: number): string {
  if (isRecord(value)) {
    for (const key of ["title", "name", "question", "platform", "label"]) {
      if (typeof value[key] === "string" && value[key].trim()) return value[key];
    }
  }
  return `Item ${String(index + 1).padStart(2, "0")}`;
}

function ContentField({
  label,
  value,
  path,
  onChange,
}: {
  label: string;
  value: unknown;
  path: PathPart[];
  onChange: (path: PathPart[], nextValue: unknown, remove?: boolean) => void;
}) {
  if (typeof value === "string") {
    if (path[path.length - 1] === "type" && path[0] === "applicationForm" && path[1] === "customFields") {
      return (
        <label className="asftbi-field">
          <span>{fieldLabel(label)}</span>
          <select value={value} onChange={(event) => onChange(path, event.target.value)}>
            <option value="text">Short answer</option>
            <option value="url">HTTPS link</option>
            <option value="textarea">Long answer</option>
            <option value="select">Dropdown</option>
          </select>
        </label>
      );
    }
    const multiline = value.length > 70 || value.includes("\n");
    return (
      <label className="asftbi-field">
        <span>{fieldLabel(label)}</span>
        <textarea
          rows={multiline ? 4 : 2}
          value={value}
          onChange={(event) => onChange(path, event.target.value)}
        />
        {label === "image" && <small>Use an existing /public path or a public HTTPS image URL.</small>}
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label className="asftbi-field">
        <span>{fieldLabel(label)}</span>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(path, Number(event.target.value))}
        />
      </label>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="asftbi-toggle">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
        />
        <span>{fieldLabel(label)}</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    const defaultArray = readAtPath(defaultContent, path);
    const template = value[0] ?? (Array.isArray(defaultArray) ? defaultArray[0] : "");
    return (
      <section className="asftbi-collection">
        <div className="asftbi-collection-head">
          <strong>{fieldLabel(label)} <small>{value.length}</small></strong>
          <button type="button" className="asftbi-secondary-button" onClick={() => onChange(path, [...value, newCollectionItem(path, template, value)])}>
            <Plus size={15} /> Add item
          </button>
        </div>
        {value.map((item, index) => {
          const itemPath = [...path, index];
          if (isRecord(item)) {
            return (
              <details className="asftbi-item" key={index}>
                <summary>
                  <span>{itemTitle(item, index)}</span>
                  <button
                    type="button"
                    className="asftbi-delete-button"
                    aria-label={`Remove ${itemTitle(item, index)}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onChange(itemPath, undefined, true);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </summary>
                <div className="asftbi-item-fields">
                  {Object.entries(item).map(([key, child]) => (
                    <ContentField key={key} label={key} value={child} path={[...itemPath, key]} onChange={onChange} />
                  ))}
                </div>
              </details>
            );
          }
          return (
            <div className="asftbi-list-item" key={index}>
              <ContentField label={`Item ${index + 1}`} value={item} path={itemPath} onChange={onChange} />
              <button type="button" className="asftbi-delete-button" aria-label={`Remove item ${index + 1}`} onClick={() => onChange(itemPath, undefined, true)}>
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </section>
    );
  }

  if (isRecord(value)) {
    return (
      <div className="asftbi-object-fields">
        {path.join(".") === "applicationForm" && <p className="asftbi-form-editor-note">Add optional or required questions to the public startup application. Each question can be a short answer, long answer, HTTPS link or dropdown. The founder and venture essentials remain available for the application review workflow.</p>}
        {Object.entries(value).map(([key, child]) => (
          <ContentField key={key} label={key} value={child} path={[...path, key]} onChange={onChange} />
        ))}
      </div>
    );
  }

  return null;
}

export default function AdminAsfTbiPage() {
  const router = useRouter();
  const [content, setContent] = useState<AsfTbiContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch("/api/admin/asf-tbi", { cache: "no-store" });
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load ASF-TBI website content.");
        setContent(data as AsfTbiContent);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load ASF-TBI website content.");
      } finally {
        setLoading(false);
      }
    }
    void loadContent();
  }, [router]);

  function updateContent(path: PathPart[], nextValue: unknown, remove = false) {
    setContent((previous) => {
      if (!previous) return previous;
      const updated: unknown = structuredClone(previous);
      writeAtPath(updated, path, nextValue, remove);
      return updated as AsfTbiContent;
    });
    setError("");
    setSuccess("");
  }

  async function saveContent() {
    if (!content) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/asf-tbi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save ASF-TBI website content.");
      setContent(data.content as AsfTbiContent);
      setSuccess("ASF-TBI website content saved and published.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save ASF-TBI website content.");
    } finally {
      setSaving(false);
    }
  }

  function resetContent() {
    if (!confirm("Restore all ASF-TBI website content to the original sample? This cannot be undone.")) return;
    setContent(structuredClone(defaultContent) as AsfTbiContent);
    setError("");
    setSuccess("Sample content restored in the editor. Save to publish the reset.");
  }

  if (loading) return <main className="asftbi-admin-page"><p>Loading ASF-TBI website content...</p></main>;

  return (
    <main className="asftbi-admin-page">
      <header className="asftbi-admin-header">
        <div><p>AKGEC SKILLS FOUNDATION · ADMIN</p><h1>ASF-TBI Website</h1><span>Update the words, profiles, events, programs and resources shown on the public incubator website.</span></div>
        <div className="asftbi-admin-actions">
          <Link href="/asf-tbi" target="_blank" rel="noreferrer">Preview website <ArrowUpRightIcon /></Link>
          <Link href="/admin/asf-tbi/applications">Startup applications</Link>
          <Link href="/admin">Admin dashboard</Link>
        </div>
      </header>

      <div className="asftbi-admin-toolbar">
        <div><strong>Website content editor</strong><span>Changes appear on the public website after you save.</span></div>
        <div>
          <button type="button" className="asftbi-reset-button" onClick={resetContent}><RotateCcw size={15} /> Restore sample</button>
          <button type="button" className="asftbi-save-button" onClick={() => void saveContent()} disabled={!content || saving}><Save size={16} />{saving ? "Saving..." : "Save and publish"}</button>
        </div>
      </div>

      {error && <p className="asftbi-admin-message asftbi-admin-error" role="alert">{error}</p>}
      {success && <p className="asftbi-admin-message asftbi-admin-success" role="status">{success}</p>}
      {!content && !error && <p className="asftbi-admin-message">Website content is unavailable.</p>}

      {content && <div className="asftbi-admin-sections">
        {Object.entries(content).map(([section, value], index) => (
          <details className="asftbi-admin-section" key={section} open={index === 0}>
            <summary><span><small>{String(index + 1).padStart(2, "0")}</small>{fieldLabel(section)}</span><span className="asftbi-section-chevron">⌄</span></summary>
            <div className="asftbi-section-content">
              <ContentField label={section} value={value} path={[section]} onChange={updateContent} />
            </div>
          </details>
        ))}
      </div>}
    </main>
  );
}

function ArrowUpRightIcon() {
  return <span aria-hidden="true">↗</span>;
}
