"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";

type Registration = {
  registrationId: string;
  responses: Record<string, string>;
  course: string;
  duration: string;
  amount: number;
  paymentId: string;
  orderId: string;
  registeredAt: string;
  status?: string;
};

const STATUS_OPTIONS = ["new", "contacted", "enrolled", "not-interested"];

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  enrolled: "Enrolled",
  "not-interested": "Not Interested",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#d9822b",
  contacted: "#3b6ea5",
  enrolled: "#2f8f4e",
  "not-interested": "#999999",
};

function flattenResponses(responses: Record<string, string>): string {
  return Object.entries(responses)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRegistrations() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/registrations");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load registrations.");
        setLoading(false);
        return;
      }
      setRecords(data.records);
      setLoading(false);
    } catch {
      setError("Could not load registrations.");
      setLoading(false);
    }
  }

  async function updateStatus(registrationId: string, status: string) {
    setUpdatingId(registrationId);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not update status.");
        return;
      }
      setRecords((prev) =>
        prev.map((r) => (r.registrationId === registrationId ? { ...r, status } : r))
      );
    } catch {
      alert("Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteRegistration(registrationId: string) {
    if (!confirm(`Delete registration ${registrationId}? This cannot be undone.`)) return;

    setDeletingId(registrationId);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not delete registration.");
        return;
      }
      setRecords((prev) => prev.filter((record) => record.registrationId !== registrationId));
    } catch {
      alert("Could not delete registration.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesStatus = statusFilter === "all" || (r.status || "new") === statusFilter;

      const q = search.trim().toLowerCase();
      const responsesText = flattenResponses(r.responses || {}).toLowerCase();
      const matchesSearch =
        !q ||
        responsesText.includes(q) ||
        r.registrationId.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, r) => sum + (r.amount || 0), 0),
    [filtered]
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Registrations</h1>
          <p style={styles.sub}>AKGEC Skills Foundation — Admin Dashboard</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Log Out
        </button>
      </header>

      <nav style={styles.nav}>
        <span style={styles.navActive}>Registrations</span>
        <Link href="/admin/courses" style={styles.navLink}>
          Courses & Pricing
        </Link>
        <Link href="/admin/form-fields" style={styles.navLink}>
          Form Builder
        </Link>
        <Link href="/admin/announcement" style={styles.navLink}>
          Announcement
        </Link>
      </nav>

      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search name, phone, ID, course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button onClick={loadRegistrations} style={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Showing</span>
          <strong style={styles.statValue}>{filtered.length}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Registrations</span>
          <strong style={styles.statValue}>{records.length}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Revenue (shown)</span>
          <strong style={styles.statValue}>₹{totalRevenue.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      {loading && <p style={styles.info}>Loading registrations…</p>}
      {error && <p style={styles.errorText}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p style={styles.info}>No registrations match your search.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Reg. ID</th>
                <th style={{ ...styles.th, whiteSpace: "normal", minWidth: 260 }}>Details</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Registered</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.registrationId}>
                  <td style={styles.tdMono}>{r.registrationId}</td>
                  <td style={{ ...styles.td, whiteSpace: "normal" }}>
                    {flattenResponses(r.responses || {}) || "—"}
                  </td>
                  <td style={styles.td}>{r.course}</td>
                  <td style={styles.td}>{r.duration}</td>
                  <td style={styles.td}>₹{r.amount.toLocaleString("en-IN")}</td>
                  <td style={styles.td}>
                    {new Date(r.registeredAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td style={styles.td}>
                    <select
                      value={r.status || "new"}
                      onChange={(e) => updateStatus(r.registrationId, e.target.value)}
                      disabled={updatingId === r.registrationId}
                      style={{
                        ...styles.statusSelect,
                        borderColor: STATUS_COLORS[r.status || "new"],
                        color: STATUS_COLORS[r.status || "new"],
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      onClick={() => deleteRegistration(r.registrationId)}
                      disabled={deletingId === r.registrationId}
                      style={styles.deleteBtn}
                      title="Delete registration"
                      aria-label={`Delete registration ${r.registrationId}`}
                    >
                      <Trash2 size={15} />
                      {deletingId === r.registrationId ? "Deleting" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#faf8f5",
    fontFamily: "'DM Sans', sans-serif",
    padding: "32px 28px 60px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    flexWrap: "wrap",
    gap: 12,
  },
  h1: { margin: 0, fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 800, color: "#252525" },
  sub: { margin: "4px 0 0", fontSize: 13, color: "#777" },
  logoutBtn: {
    padding: "10px 18px",
    border: "1px solid #ded9d2",
    borderRadius: 10,
    background: "#fff",
    color: "#4b4b4b",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  nav: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
    borderBottom: "1px solid #ded9d2",
    flexWrap: "wrap",
  },
  navLink: {
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#777",
    textDecoration: "none",
    borderBottom: "2px solid transparent",
  },
  navActive: {
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 700,
    color: "#7b1e2b",
    borderBottom: "2px solid #7b1e2b",
  },
  toolbar: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  search: {
    flex: "1 1 260px",
    padding: "10px 14px",
    border: "1px solid #ded9d2",
    borderRadius: 10,
    fontSize: 14,
  },
  select: { padding: "10px 14px", border: "1px solid #ded9d2", borderRadius: 10, fontSize: 14, background: "#fff" },
  refreshBtn: {
    padding: "10px 18px",
    border: "1px solid #7b1e2b",
    borderRadius: 10,
    background: "#7b1e2b",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  statsRow: { display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" },
  statCard: { flex: "1 1 160px", padding: "16px 20px", background: "#fff", border: "1px solid #ded9d2", borderRadius: 12 },
  statLabel: { display: "block", fontSize: 12, color: "#777", marginBottom: 6 },
  statValue: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: "#7b1e2b" },
  info: { color: "#777", fontSize: 14 },
  errorText: { color: "#a33b49", fontSize: 14 },
  tableWrap: { overflowX: "auto", background: "#fff", border: "1px solid #ded9d2", borderRadius: 14 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    background: "#f3eee8",
    color: "#4b4b4b",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #ded9d2",
  },
  td: { padding: "12px 14px", borderBottom: "1px solid #eee9e3", color: "#252525", whiteSpace: "nowrap" },
  tdMono: {
    padding: "12px 14px",
    borderBottom: "1px solid #eee9e3",
    color: "#7b1e2b",
    fontWeight: 700,
    fontFamily: "monospace",
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  statusSelect: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1.5px solid",
    fontSize: 12,
    fontWeight: 700,
    background: "#fff",
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 10px",
    border: "1px solid #f0d4d4",
    borderRadius: 8,
    background: "#fdecec",
    color: "#a33b49",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
};
