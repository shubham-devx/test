"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Announcement = {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  style: "info" | "urgent";
};

export default function AdminAnnouncementPage() {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement>({
    enabled: false,
    text: "",
    linkText: "",
    linkUrl: "",
    style: "info",
  });
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
      const res = await fetch("/api/admin/announcement");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load the announcement.");
        setLoading(false);
        return;
      }
      setAnnouncement(data);
      setLoading(false);
    } catch {
      setError("Could not load the announcement.");
      setLoading(false);
    }
  }

  async function deleteAnnouncement() {
    if (!confirm("Delete this announcement? This turns off the banner and clears its text/link.")) {
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/announcement", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not delete the announcement.");
        setSaving(false);
        return;
      }
      setAnnouncement(data.announcement);
      setSuccess("Announcement deleted. The banner is now off.");
      setSaving(false);
    } catch {
      setError("Could not delete the announcement.");
      setSaving(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcement),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save the announcement.");
        setSaving(false);
        return;
      }
      setAnnouncement(data.announcement);
      setSuccess("Saved. It's live on the site immediately.");
      setSaving(false);
    } catch {
      setError("Could not save the announcement.");
      setSaving(false);
    }
  }

  const isUrgent = announcement.style === "urgent";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Announcement Banner</h1>
          <p style={styles.sub}>
            Shows a highlight bar just below the site header. Turn it off any time.
          </p>
        </div>
        <Link href="/admin" style={styles.backLink}>
          ← Back to Registrations
        </Link>
      </header>

      {loading && <p style={styles.info}>Loading…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {success && <p style={styles.successText}>{success}</p>}

      {!loading && (
        <>
          <div style={styles.card}>
            <label style={styles.toggleRow}>
              <input
                type="checkbox"
                checked={announcement.enabled}
                onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
              />
              <span>Show announcement banner on the site</span>
            </label>

            <label style={styles.fieldLabel}>Message</label>
            <textarea
              value={announcement.text}
              onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
              placeholder="e.g. Admissions open for the January batch — limited seats!"
              rows={2}
              style={styles.textarea}
            />

            <div style={styles.row2}>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Link Text (optional)</label>
                <input
                  value={announcement.linkText ?? ""}
                  onChange={(e) => setAnnouncement({ ...announcement, linkText: e.target.value })}
                  placeholder="e.g. Register Now"
                  style={styles.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.fieldLabel}>Link URL (optional)</label>
                <input
                  value={announcement.linkUrl ?? ""}
                  onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                  placeholder="e.g. #proud-moments or https://..."
                  style={styles.input}
                />
              </div>
            </div>

            <label style={styles.fieldLabel}>Style</label>
            <div style={styles.styleRow}>
              <button
                onClick={() => setAnnouncement({ ...announcement, style: "info" })}
                style={{
                  ...styles.styleBtn,
                  background: !isUrgent ? "#d9822b" : "#fff",
                  color: !isUrgent ? "#fff" : "#4b4b4b",
                  borderColor: !isUrgent ? "#d9822b" : "#ded9d2",
                }}
              >
                Info (saffron)
              </button>
              <button
                onClick={() => setAnnouncement({ ...announcement, style: "urgent" })}
                style={{
                  ...styles.styleBtn,
                  background: isUrgent ? "#7b1e2b" : "#fff",
                  color: isUrgent ? "#fff" : "#4b4b4b",
                  borderColor: isUrgent ? "#7b1e2b" : "#ded9d2",
                }}
              >
                Urgent (maroon)
              </button>
            </div>
          </div>

          {announcement.enabled && announcement.text.trim() && (
            <div style={styles.previewWrap}>
              <span style={styles.previewLabel}>Preview</span>
              <div
                style={{
                  ...styles.previewBanner,
                  background: isUrgent ? "#7b1e2b" : "#d9822b",
                }}
              >
                {announcement.text}
                {announcement.linkUrl && announcement.linkText && (
                  <span style={styles.previewLink}>{announcement.linkText}</span>
                )}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button
              onClick={deleteAnnouncement}
              disabled={saving}
              style={styles.deleteBtn}
            >
              Delete Announcement
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
  card: {
    background: "#fff",
    border: "1px solid #ded9d2",
    borderRadius: 14,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxWidth: 620,
    marginBottom: 20,
  },
  toggleRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#252525", marginBottom: 14, cursor: "pointer" },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: "#4b4b4b", marginTop: 12, marginBottom: 6 },
  textarea: {
    width: "100%", boxSizing: "border-box", padding: "10px 14px", border: "1px solid #ded9d2",
    borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical",
  },
  row2: { display: "flex", gap: 14, flexWrap: "wrap" },
  input: { width: "100%", boxSizing: "border-box", padding: "10px 14px", border: "1px solid #ded9d2", borderRadius: 10, fontSize: 13 },
  styleRow: { display: "flex", gap: 10 },
  styleBtn: { padding: "9px 16px", border: "1.5px solid", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  previewWrap: { marginBottom: 20 },
  previewLabel: { display: "block", fontSize: 12, fontWeight: 700, color: "#777", marginBottom: 8 },
  previewBanner: {
    padding: "12px 20px", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, maxWidth: 620,
  },
  previewLink: { marginLeft: 8, fontWeight: 800, textDecoration: "underline" },
  actions: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  deleteBtn: {
    padding: "12px 22px", border: "1px solid #f0d4d4", borderRadius: 10, background: "#fdecec",
    color: "#a33b49", fontSize: 13, fontWeight: 800, cursor: "pointer",
  },
  saveBtn: {
    padding: "12px 26px", border: 0, borderRadius: 10, background: "#7b1e2b",
    color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer",
  },
};
