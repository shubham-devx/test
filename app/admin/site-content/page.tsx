"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Save, Trash2 } from "lucide-react";
import type { SiteContent, SiteSection } from "@/lib/siteContent";
import { SITE_THEMES, type SiteTheme } from "@/lib/siteThemes";

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "9px 11px",
  border: "1px solid #d5ccc4",
  borderRadius: 6,
  background: "#fff",
  color: "#281d19",
  font: "inherit",
  fontSize: 14,
} as const;

const labelStyle = { display: "grid", gap: 6, color: "#51443d", fontSize: 13, fontWeight: 700 } as const;
const panelStyle = { padding: "20px 0", borderBottom: "1px solid #e6ddd5" } as const;
const buttonStyle = {
  minHeight: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "0 14px",
  border: "1px solid #641c1c",
  borderRadius: 6,
  background: "#641c1c",
  color: "#fff",
  font: "inherit",
  fontSize: 14,
  fontWeight: 750,
  cursor: "pointer",
} as const;

export default function AdminSiteContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/site-content", { cache: "no-store" });
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load website content.");
        setContent(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load website content.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  function updateSection(section: SiteSection, field: string, value: string) {
    setContent((previous) => previous ? {
      ...previous,
      [section]: { ...previous[section], [field]: value },
    } : previous);
  }

  function updateTraining(index: number, patch: Partial<SiteContent["trainingPrograms"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      trainingPrograms: previous.trainingPrograms.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    } : previous);
  }

  function updateCentre(index: number, patch: Partial<SiteContent["centresList"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      centresList: previous.centresList.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    } : previous);
  }

  function updateIndustryArea(index: number, patch: Partial<SiteContent["industryFocusAreas"][number]>) {
    setContent((previous) => previous ? {
      ...previous,
      industryFocusAreas: previous.industryFocusAreas.map((area, areaIndex) => areaIndex === index ? { ...area, ...patch } : area),
    } : previous);
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save website content.");
      setContent(data.content);
      setSuccess("Website content saved and published.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save website content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main style={styles.page}><p>Loading website content...</p></main>;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Website Content</h1>
          <p style={styles.subtitle}>Edit the four homepage sections, training cards, centre details and industry areas.</p>
        </div>
        <Link href="/admin" style={styles.backLink}>Dashboard</Link>
      </header>

      {error && <p role="alert" style={styles.error}>{error}</p>}
      {success && <p role="status" style={styles.success}>{success}</p>}
      {!content && !error && <p>Website content is unavailable.</p>}

      {content && <>
        <section style={panelStyle}>
          <h2 style={styles.sectionTitle}>Website Colours</h2>
          <p style={styles.themeIntro}>Choose a professional palette for buttons, headings and accent details across the site.</p>
          <div style={styles.themeGrid}>
            {(Object.keys(SITE_THEMES) as SiteTheme[]).map((theme) => {
              const palette = SITE_THEMES[theme];
              const selected = content.theme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setContent({ ...content, theme })}
                  style={{ ...styles.themeOption, borderColor: selected ? palette.primary : "#e1d8d0" }}
                >
                  <span style={styles.themeSwatches} aria-hidden="true">
                    <span style={{ ...styles.themeSwatch, background: palette.primary }} />
                    <span style={{ ...styles.themeSwatch, background: palette.accent }} />
                    <span style={{ ...styles.themeSwatch, background: palette.dark }} />
                  </span>
                  <strong>{palette.label}</strong>
                  <span style={styles.themeDescription}>{palette.description}</span>
                  <small style={{ ...styles.themeStatus, color: selected ? palette.primary : "#695c53" }}>
                    {selected ? "Selected" : "Select palette"}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={styles.sectionTitle}>Navigation</h2>
          <div style={styles.grid}>
            {content.navigation.map((item, index) => (
              <label key={item.section} style={labelStyle}>
                {item.section === "about" ? "About" : item.section === "centres" ? "Centres of Excellence" : item.section[0].toUpperCase() + item.section.slice(1)}
                <input
                  style={inputStyle}
                  value={item.label}
                  onChange={(event) => setContent((previous) => previous ? {
                    ...previous,
                    navigation: previous.navigation.map((entry, entryIndex) => entryIndex === index ? { ...entry, label: event.target.value } : entry),
                  } : previous)}
                />
              </label>
            ))}
          </div>
        </section>

        {(["about", "training", "centres", "industry"] as SiteSection[]).map((section) => {
          const fields = content[section];
          return (
            <section key={section} style={panelStyle}>
              <h2 style={styles.sectionTitle}>{section === "about" ? "About Foundation" : section === "centres" ? "Centres of Excellence" : section[0].toUpperCase() + section.slice(1)}</h2>
              <div style={styles.grid}>
                <label style={labelStyle}>Eyebrow / label<input style={inputStyle} value={fields.label} onChange={(event) => updateSection(section, "label", event.target.value)} /></label>
                <label style={labelStyle}>Section heading<textarea style={inputStyle} rows={2} value={fields.heading} onChange={(event) => updateSection(section, "heading", event.target.value)} /></label>
                {section === "about" && <label style={labelStyle}>Introduction<textarea style={{ ...inputStyle, minHeight: 96 }} rows={4} value={content.about.lead} onChange={(event) => updateSection("about", "lead", event.target.value)} /></label>}
                <label style={labelStyle}>Description<textarea style={{ ...inputStyle, minHeight: 96 }} rows={4} value={fields.description} onChange={(event) => updateSection(section, "description", event.target.value)} /></label>
              </div>
            </section>
          );
        })}

        <section style={panelStyle}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Training Cards</h2>
            <button type="button" style={styles.secondaryButton} onClick={() => setContent({ ...content, trainingPrograms: [...content.trainingPrograms, { icon: "automation", title: "New programme", text: "Add programme details." }] })}><Plus size={16} /> Add training</button>
          </div>
          <div style={styles.items}>
            {content.trainingPrograms.map((item, index) => (
              <article key={index} style={styles.item}>
                <div style={styles.itemHead}><strong>Training {String(index + 1).padStart(2, "0")}</strong><button type="button" aria-label={`Remove ${item.title}`} style={styles.deleteButton} onClick={() => setContent({ ...content, trainingPrograms: content.trainingPrograms.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={16} /></button></div>
                <div style={styles.grid}>
                  <label style={labelStyle}>Title<input style={inputStyle} value={item.title} onChange={(event) => updateTraining(index, { title: event.target.value })} /></label>
                  <label style={labelStyle}>Icon<select style={inputStyle} value={item.icon} onChange={(event) => updateTraining(index, { icon: event.target.value })}><option value="robotics">Robotics</option><option value="automation">Automation</option><option value="manufacturing">Manufacturing</option><option value="certification">Certification</option></select></label>
                  <label style={labelStyle}>Details<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={item.text} onChange={(event) => updateTraining(index, { text: event.target.value })} /></label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Industry Focus Cards</h2>
            <button type="button" style={styles.secondaryButton} onClick={() => setContent({ ...content, industryFocusAreas: [...content.industryFocusAreas, { icon: "automation", name: "New focus area", details: "Add the sector details shown when visitors open this card." }] })}><Plus size={16} /> Add focus area</button>
          </div>
          <div style={styles.items}>
            {content.industryFocusAreas.map((area, index) => (
              <article key={index} style={styles.item}>
                <div style={styles.itemHead}>
                  <strong>Focus area {String(index + 1).padStart(2, "0")}</strong>
                  <button type="button" aria-label={`Remove ${area.name}`} style={styles.deleteButton} onClick={() => setContent({ ...content, industryFocusAreas: content.industryFocusAreas.filter((_, areaIndex) => areaIndex !== index) })}><Trash2 size={16} /></button>
                </div>
                <div style={styles.grid}>
                  <label style={labelStyle}>Title<input style={inputStyle} value={area.name} onChange={(event) => updateIndustryArea(index, { name: event.target.value })} /></label>
                  <label style={labelStyle}>Icon<select style={inputStyle} value={area.icon} onChange={(event) => updateIndustryArea(index, { icon: event.target.value as "automation" | "aerospace" | "healthcare" })}><option value="automation">Automation</option><option value="aerospace">Aerospace & Defence</option><option value="healthcare">Healthcare</option></select></label>
                  <label style={labelStyle}>Details shown when opened<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={area.details} onChange={(event) => updateIndustryArea(index, { details: event.target.value })} /></label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>Centres of Excellence ({content.centresList.length})</h2>
            <button type="button" style={styles.secondaryButton} onClick={() => setContent({ ...content, centresList: [...content.centresList, { name: "New centre", partner: "", focus: "", description: "", itemsTitle: "Programmes and facilities", items: [], recognition: "" }] })}><Plus size={16} /> Add centre</button>
          </div>
          <div style={styles.items}>
            {content.centresList.map((centre, index) => (
              <details key={index} style={styles.item}>
                <summary style={styles.summary}><span>{String(index + 1).padStart(2, "0")} · {centre.name}</span><button type="button" aria-label={`Remove ${centre.name}`} style={styles.deleteButton} onClick={(event) => { event.preventDefault(); if (confirm(`Remove ${centre.name}?`)) setContent({ ...content, centresList: content.centresList.filter((_, itemIndex) => itemIndex !== index) }); }}><Trash2 size={16} /></button></summary>
                <div style={styles.grid}>
                  <label style={labelStyle}>Centre name<input style={inputStyle} value={centre.name} onChange={(event) => updateCentre(index, { name: event.target.value })} /></label>
                  <label style={labelStyle}>Industry partner<input style={inputStyle} value={centre.partner} onChange={(event) => updateCentre(index, { partner: event.target.value })} /></label>
                  <label style={labelStyle}>Area of focus<input style={inputStyle} value={centre.focus} onChange={(event) => updateCentre(index, { focus: event.target.value })} /></label>
                  <label style={labelStyle}>Description<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={centre.description} onChange={(event) => updateCentre(index, { description: event.target.value })} /></label>
                  <label style={labelStyle}>List heading<input style={inputStyle} value={centre.itemsTitle} onChange={(event) => updateCentre(index, { itemsTitle: event.target.value })} /></label>
                  <label style={labelStyle}>Programmes or facilities, one per line<textarea style={{ ...inputStyle, minHeight: 120 }} rows={5} value={centre.items.join("\n")} onChange={(event) => updateCentre(index, { items: event.target.value.split("\n") })} /></label>
                  <label style={labelStyle}>Recognition and notes<textarea style={{ ...inputStyle, minHeight: 88 }} rows={3} value={centre.recognition} onChange={(event) => updateCentre(index, { recognition: event.target.value })} /></label>
                </div>
              </details>
            ))}
          </div>
        </section>

        <div style={styles.saveBar}>
          <span>Changes go live on the public homepage after saving.</span>
          <button type="button" style={buttonStyle} onClick={save} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save and publish"}</button>
        </div>
      </>}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 1120, margin: "0 auto", padding: "28px 24px 100px", color: "#281d19", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, paddingBottom: 20, borderBottom: "1px solid #e6ddd5" },
  title: { margin: 0, fontSize: 30, lineHeight: 1.2 },
  subtitle: { margin: "8px 0 0", color: "#695c53", fontSize: 14 },
  backLink: { color: "#641c1c", fontSize: 14, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 },
  sectionTitle: { margin: 0, fontSize: 19, lineHeight: 1.3 },
  themeIntro: { margin: "7px 0 0", color: "#695c53", fontSize: 14 },
  themeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 12, marginTop: 16 },
  themeOption: { minHeight: 132, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 14, border: "2px solid", borderRadius: 7, background: "#fff", color: "#281d19", font: "inherit", textAlign: "left", cursor: "pointer" },
  themeSwatches: { display: "flex", gap: 6, marginBottom: 4 },
  themeSwatch: { width: 26, height: 26, display: "block", borderRadius: 5 },
  themeDescription: { color: "#695c53", fontSize: 12 },
  themeStatus: { marginTop: "auto", fontSize: 12, fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 14, marginTop: 16 },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 },
  secondaryButton: { minHeight: 38, display: "inline-flex", alignItems: "center", gap: 7, padding: "0 12px", border: "1px solid #bcae9f", borderRadius: 6, background: "#fff", color: "#641c1c", font: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  items: { display: "grid", gap: 12, marginTop: 14 },
  item: { padding: 14, border: "1px solid #e1d8d0", borderRadius: 6, background: "#fff" },
  itemHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, color: "#51443d", fontSize: 14 },
  summary: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer", fontSize: 15, fontWeight: 750 },
  deleteButton: { width: 36, height: 36, display: "grid", placeItems: "center", border: "1px solid #e4c9c4", borderRadius: 5, background: "#fff", color: "#982f25", cursor: "pointer" },
  saveBar: { position: "sticky", bottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 24, padding: 12, border: "1px solid #ddd2ca", borderRadius: 8, background: "rgba(255,253,249,.97)", boxShadow: "0 4px 20px rgba(40,25,20,.12)", fontSize: 13 },
  error: { padding: 12, borderRadius: 6, background: "#fff1ee", color: "#8a291f", fontWeight: 700 },
  success: { padding: 12, borderRadius: 6, background: "#edf7ef", color: "#28643a", fontWeight: 700 },
};
