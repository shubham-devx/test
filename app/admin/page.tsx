"use client";

import "./admin-dashboard.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  DollarSign,
  Search,
  Trash2,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import type { AdminActivity } from "@/lib/adminActivity";
import type { AsfTbiApplication } from "@/lib/asfTbiApplications";
import type { AsfTbiApplicationStatus } from "@/lib/asfTbiApplicationStatus";

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

type DashboardContent = {
  events: { title: string; date: string; status: string }[];
};

const registrationStatuses = ["new", "contacted", "enrolled", "not-interested"];
const registrationStatusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  enrolled: "Enrolled",
  "not-interested": "Not interested",
};
const applicationStatusLabels: Record<AsfTbiApplicationStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under review",
  shortlisted: "Shortlisted",
  "interview-scheduled": "Interview scheduled",
  approved: "Approved",
  rejected: "Rejected",
};
const pageSize = 10;

function flattenResponses(responses: Record<string, string>): string {
  return Object.entries(responses ?? {})
    .filter(([, value]) => value?.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

async function getJson<T>(url: string, router: ReturnType<typeof useRouter>): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 401) {
    router.push("/admin/login");
    throw new Error("Your administrator session has expired.");
  }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Could not load dashboard data.");
  return payload as T;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Registration[]>([]);
  const [applications, setApplications] = useState<AsfTbiApplication[]>([]);
  const [content, setContent] = useState<DashboardContent | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const [registrationResult, applicationResult, contentResult, activityResult] = await Promise.allSettled([
      getJson<{ records: Registration[] }>("/api/admin/registrations", router),
      getJson<{ applications: AsfTbiApplication[] }>("/api/admin/asf-tbi/applications", router),
      getJson<DashboardContent>("/api/admin/asf-tbi", router),
      getJson<{ activities: AdminActivity[] }>("/api/admin/asf-tbi/activity", router),
    ]);
    const messages: string[] = [];
    if (registrationResult.status === "fulfilled") setRecords(registrationResult.value.records);
    else messages.push(`Registrations: ${registrationResult.reason instanceof Error ? registrationResult.reason.message : "Could not load."}`);
    if (applicationResult.status === "fulfilled") setApplications(applicationResult.value.applications);
    else messages.push(`Startup applications: ${applicationResult.reason instanceof Error ? applicationResult.reason.message : "Could not load."}`);
    if (contentResult.status === "fulfilled") setContent(contentResult.value);
    else messages.push(`Website events: ${contentResult.reason instanceof Error ? contentResult.reason.message : "Could not load."}`);
    if (activityResult.status === "fulfilled") setActivities(activityResult.value.activities);
    else messages.push(`Activity log: ${activityResult.reason instanceof Error ? activityResult.reason.message : "Could not load."}`);
    setErrors(messages);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  async function updateStatus(registrationId: string, status: string) {
    setUpdatingId(registrationId);
    setErrors([]);
    try {
      const response = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update registration status.");
      setRecords((previous) => previous.map((record) => record.registrationId === registrationId ? { ...record, status } : record));
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Could not update registration status."]);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteRegistration(registrationId: string) {
    if (!window.confirm(`Delete registration ${registrationId}? This cannot be undone.`)) return;
    setDeletingId(registrationId);
    setErrors([]);
    try {
      const response = await fetch("/api/admin/registrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete registration.");
      setRecords((previous) => previous.filter((record) => record.registrationId !== registrationId));
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Could not delete registration."]);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => records.filter((record) => {
    const matchesStatus = statusFilter === "all" || (record.status || "new") === statusFilter;
    const searchText = search.trim().toLowerCase();
    const registeredDate = new Date(record.registeredAt);
    const dateKey = Number.isNaN(registeredDate.getTime()) ? "" : registeredDate.toISOString().slice(0, 10);
    const matchesDate = (!dateFrom || dateKey >= dateFrom) && (!dateTo || dateKey <= dateTo);
    const matchesSearch = !searchText ||
      flattenResponses(record.responses || {}).toLowerCase().includes(searchText) ||
      record.registrationId.toLowerCase().includes(searchText) ||
      record.course.toLowerCase().includes(searchText);
    return matchesStatus && matchesDate && matchesSearch;
  }), [records, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedRecords = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalRevenue = records.reduce((sum, record) => sum + (record.amount || 0), 0);
  const pendingCount = applications.filter((application) => !["approved", "rejected"].includes(application.status)).length;
  const approvedCount = applications.filter((application) => application.status === "approved").length;
  const rejectedCount = applications.filter((application) => application.status === "rejected").length;
  const upcomingEvents = content?.events.filter((event) => event.status === "upcoming") ?? [];
  const trackedApplicationStatuses: AsfTbiApplicationStatus[] = ["submitted", "under-review", "shortlisted", "interview-scheduled", "approved", "rejected"];
  const maxStatusCount = Math.max(1, ...trackedApplicationStatuses.map((status) => applications.filter((application) => application.status === status).length));

  return (
    <AdminShell active="dashboard" title="Dashboard" subtitle="WORKSPACE OVERVIEW">
      <main className="admin-dashboard">
        <section className="admin-welcome">
          <div><span className="admin-eyebrow">OVERVIEW</span><h1>Good to see you.</h1><p>Your AKGEC Skills Foundation activity at a glance.</p></div>
          <div className="admin-welcome-actions"><span><Clock3 size={15} />{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span><button type="button" onClick={() => void loadDashboard()} disabled={loading}>{loading ? "Refreshing…" : "Refresh overview"}</button></div>
        </section>

        {errors.length > 0 && <div className="admin-dashboard-alert" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}

        <section className="admin-metric-grid" aria-label="ASF-TBI overview">
          <article className="admin-metric-card"><span className="admin-metric-icon admin-metric-blue"><Users size={19} /></span><span className="admin-metric-label">Startup applications</span><strong>{loading && !applications.length ? "—" : applications.length}</strong><small>Live submitted records</small></article>
          <article className="admin-metric-card"><span className="admin-metric-icon admin-metric-orange"><Clock3 size={19} /></span><span className="admin-metric-label">Pending review</span><strong>{loading && !applications.length ? "—" : pendingCount}</strong><small>Submitted through interview stage</small></article>
          <article className="admin-metric-card"><span className="admin-metric-icon admin-metric-green"><CheckCircle2 size={19} /></span><span className="admin-metric-label">Approved</span><strong>{loading && !applications.length ? "—" : approvedCount}</strong><small>Approved application records</small></article>
          <article className="admin-metric-card"><span className="admin-metric-icon admin-metric-red"><XCircle size={19} /></span><span className="admin-metric-label">Rejected</span><strong>{loading && !applications.length ? "—" : rejectedCount}</strong><small>Rejected application records</small></article>
          <article className="admin-metric-card"><span className="admin-metric-icon admin-metric-cyan"><UserRoundCheck size={19} /></span><span className="admin-metric-label">Registered startups</span><strong>—</strong><small>Not tracked in a separate registry</small></article>
          <article className="admin-metric-card"><span className="admin-metric-icon admin-metric-violet"><CalendarDays size={19} /></span><span className="admin-metric-label">Upcoming events</span><strong>{content ? upcomingEvents.length : "—"}</strong><small>Website content · sample entries may be included</small></article>
        </section>

        <section className="admin-insights-grid" id="reports">
          <article className="admin-panel admin-status-chart">
            <div className="admin-panel-heading"><div><span className="admin-eyebrow">APPLICATION PIPELINE</span><h2>Application status</h2></div><Link href="/admin/asf-tbi/applications">View all <ArrowRight size={15} /></Link></div>
            <p className="admin-panel-note">{applications.length} records · live application data</p>
            <div className="admin-status-bars">
              {trackedApplicationStatuses.map((status) => {
                const count = applications.filter((application) => application.status === status).length;
                return <div className="admin-status-row" key={status}><span>{applicationStatusLabels[status]}</span><div className="admin-bar-track"><span className={`admin-bar-fill admin-bar-${status}`} style={{ width: `${(count / maxStatusCount) * 100}%` }} /></div><strong>{count}</strong></div>;
              })}
            </div>
          </article>
          <article className="admin-panel admin-quick-stats">
            <div className="admin-panel-heading"><div><span className="admin-eyebrow">AKGEC OPERATIONS</span><h2>Registration activity</h2></div><DollarSign size={19} /></div>
            <div className="admin-quick-stat"><span>All course registrations</span><strong>{records.length}</strong></div>
            <div className="admin-quick-stat"><span>Enrolled</span><strong>{records.filter((record) => record.status === "enrolled").length}</strong></div>
            <div className="admin-quick-stat"><span>Recorded revenue</span><strong>₹{totalRevenue.toLocaleString("en-IN")}</strong></div>
            <Link href="#registrations" className="admin-panel-link">Manage registrations <ArrowRight size={15} /></Link>
          </article>
        </section>

        <section className="admin-lower-grid">
          <article className="admin-panel admin-recent-applications">
            <div className="admin-panel-heading"><div><span className="admin-eyebrow">LATEST SUBMISSIONS</span><h2>Recent applications</h2></div><Link href="/admin/asf-tbi/applications">Open application manager <ArrowRight size={15} /></Link></div>
            {applications.length ? <div className="admin-recent-list">{applications.slice(0, 5).map((application) => <div className="admin-recent-application" key={application.id}><span className="admin-recent-avatar">{application.startupName.slice(0, 1).toUpperCase()}</span><div><strong>{application.startupName}</strong><small>{application.founderName} · {formatDate(application.submittedAt)}</small></div><span className={`admin-app-status admin-app-status-${application.status}`}>{applicationStatusLabels[application.status]}</span></div>)}</div> : <p className="admin-empty-note">{loading ? "Loading applications…" : "No startup applications have been submitted yet."}</p>}
          </article>
          <article className="admin-panel admin-recent-activity">
            <div className="admin-panel-heading"><div><span className="admin-eyebrow">AUDIT TRAIL</span><h2>Recent activity</h2></div><Clock3 size={18} /></div>
            {activities.length ? <ol>{activities.slice(0, 6).map((activity) => <li key={activity.id}><span className="admin-activity-dot" /><div><strong>{activity.action}</strong><small>{activity.entity} · {activity.entityId}</small><time dateTime={activity.occurredAt}>{formatDate(activity.occurredAt)}</time></div></li>)}</ol> : <p className="admin-empty-note">{loading ? "Loading activity…" : "Admin updates will appear here as they are recorded."}</p>}
          </article>
        </section>

        <section className="admin-panel admin-registrations-panel" id="registrations">
          <div className="admin-panel-heading admin-registrations-heading"><div><span className="admin-eyebrow">AKGEC SKILLS FOUNDATION</span><h2>Course registrations</h2><p>Existing registrations and payment records are preserved.</p></div><span className="admin-record-total">{records.length} total records</span></div>
          <div className="admin-table-toolbar">
            <label className="admin-table-search"><Search size={16} /><span className="admin-visually-hidden">Search registrations</span><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search name, phone, ID or course" /></label>
            <label>Status<select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}><option value="all">All statuses</option>{registrationStatuses.map((status) => <option key={status} value={status}>{registrationStatusLabels[status]}</option>)}</select></label>
            <label>From<input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setPage(1); setDateFrom(event.target.value); }} /></label>
            <label>To<input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setPage(1); setDateTo(event.target.value); }} /></label>
            <span>{filtered.length} shown</span>
          </div>
          {loading && <p className="admin-empty-note">Loading course registrations…</p>}
          {!loading && filtered.length === 0 && <p className="admin-empty-note">No registrations match the selected filters.</p>}
          {!loading && filtered.length > 0 && <div className="admin-table-wrap"><table className="admin-data-table">
            <thead><tr><th>Registration</th><th>Applicant details</th><th>Course</th><th>Amount</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{pagedRecords.map((record) => <tr key={record.registrationId}>
              <td><code>{record.registrationId}</code></td>
              <td className="admin-registration-details">{flattenResponses(record.responses || {}) || "—"}</td>
              <td>{record.course}<small>{record.duration}</small></td>
              <td>₹{record.amount.toLocaleString("en-IN")}</td>
              <td>{formatDate(record.registeredAt)}</td>
              <td><select className={`admin-registration-status admin-registration-${record.status || "new"}`} value={record.status || "new"} disabled={updatingId === record.registrationId} onChange={(event) => void updateStatus(record.registrationId, event.target.value)} aria-label={`Status for registration ${record.registrationId}`}>{registrationStatuses.map((status) => <option key={status} value={status}>{registrationStatusLabels[status]}</option>)}</select></td>
              <td><button className="admin-delete-button" type="button" onClick={() => void deleteRegistration(record.registrationId)} disabled={deletingId === record.registrationId} aria-label={`Delete registration ${record.registrationId}`}><Trash2 size={15} />{deletingId === record.registrationId ? "Deleting" : "Delete"}</button></td>
            </tr>)}</tbody>
          </table></div>}
          {filtered.length > 0 &&           <div className="admin-table-pagination"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={14} />Previous</button><span>Page {page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next<ArrowRight size={14} /></button></div></div>}
        </section>
      </main>
    </AdminShell>
  );
}
