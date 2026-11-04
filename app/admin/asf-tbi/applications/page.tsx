"use client";

import "./applications.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { spreadsheetCsvCell } from "@/lib/csv";
import type {
  AsfTbiApplication,
  AsfTbiApplicationHistoryEntry,
} from "@/lib/asfTbiApplications";
import { isAsfTbiApplicationStatus } from "@/lib/asfTbiApplicationStatus";
import type { AsfTbiApplicationStatus } from "@/lib/asfTbiApplicationStatus";

const statuses: AsfTbiApplicationStatus[] = [
  "submitted",
  "under-review",
  "shortlisted",
  "interview-scheduled",
  "approved",
  "rejected",
];
const statusLabels: Record<AsfTbiApplicationStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under Review",
  shortlisted: "Shortlisted",
  "interview-scheduled": "Interview Scheduled",
  approved: "Approved",
  rejected: "Rejected",
};
const pageSize = 10;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function historySummary(entry: AsfTbiApplicationHistoryEntry): string {
  if (entry.action === "status_changed" && entry.status) {
    return `Status changed from ${entry.previousStatus ? statusLabels[entry.previousStatus] : "Unknown"} to ${statusLabels[entry.status]}`;
  }
  return "Admin remarks updated";
}

export default function AsfTbiApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AsfTbiApplication[]>([]);
  const [remarksDrafts, setRemarksDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/asf-tbi/applications", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load startup applications.");
      const records = data.applications as AsfTbiApplication[];
      setApplications(records);
      setRemarksDrafts(Object.fromEntries(records.map((record) => [record.id, record.adminRemarks ?? ""])));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load startup applications.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchApplications(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchApplications]);

  const visibleApplications = useMemo(() => {
    const search = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const submittedAt = Date.parse(application.submittedAt);
      const submittedDate = Number.isFinite(submittedAt) ? new Date(submittedAt).toISOString().slice(0, 10) : "";
      const matchesDate = (!dateFrom || submittedDate >= dateFrom) && (!dateTo || submittedDate <= dateTo);
      const customAnswers = Object.values(application.customFields ?? {}).map(({ label, value }) => `${label} ${value}`);
      const matchesQuery = !search || [
        application.id,
        application.founderName,
        application.email,
        application.startupName,
        application.industry,
        application.city,
        ...customAnswers,
      ].some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesDate && matchesQuery;
    });
  }, [applications, query, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(visibleApplications.length / pageSize));
  const pageApplications = visibleApplications.slice((page - 1) * pageSize, page * pageSize);

  async function updateApplication(application: AsfTbiApplication, update: {
    status?: AsfTbiApplicationStatus;
    adminRemarks?: string;
  }) {
    setSavingId(application.id);
    setError("");
    try {
      const response = await fetch("/api/admin/asf-tbi/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: application.id, ...update }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update the application.");
      setApplications((previous) => previous.map((entry) => entry.id === application.id ? data.application : entry));
      setRemarksDrafts((previous) => ({ ...previous, [application.id]: data.application.adminRemarks ?? "" }));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the application.");
    } finally {
      setSavingId(null);
    }
  }

  function exportApplications() {
    const rows = [
      ["Application ID", "Submitted", "Status", "Founder", "Email", "Phone", "Startup", "Industry", "Stage", "City", "Team size", "Website", "Problem", "Solution", "Description", "Traction", "Support needs", "Pitch deck", "Admin remarks", "Custom answers"],
      ...visibleApplications.map((application) => [
        application.id,
        application.submittedAt,
        statusLabels[application.status],
        application.founderName,
        application.email,
        application.phone,
        application.startupName,
        application.industry,
        application.stage,
        application.city,
        application.teamSize,
        application.website,
        application.problem,
        application.solution,
        application.description,
        application.traction,
        application.supportNeeds,
        application.pitchDeckUrl,
        application.adminRemarks ?? "",
        Object.values(application.customFields ?? {}).map(({ label, value }) => `${label}: ${value}`).join(" | "),
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(spreadsheetCsvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `asf-tbi-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  return (
    <AdminShell active="applications" title="Startup applications" subtitle="INCUBATION PIPELINE">
      <main className="asftbi-applications-page">
        <header className="asftbi-applications-header">
          <div>
            <span className="asftbi-applications-eyebrow">INCUBATION PIPELINE</span>
            <h1>Startup applications</h1>
            <p>Review submitted founder details, documents, decisions and internal remarks.</p>
          </div>
          <div className="asftbi-applications-header-actions">
            <button type="button" onClick={exportApplications} disabled={!visibleApplications.length}><ArrowDownToLine size={16} /> Export Excel CSV</button>
            <button type="button" onClick={() => { setLoading(true); void fetchApplications(); }} disabled={loading}><RefreshCw size={15} /> Refresh</button>
          </div>
        </header>

        <div className="asftbi-applications-summary">
          <article><span>Total applications</span><strong>{applications.length}</strong></article>
          <article><span>Submitted</span><strong>{applications.filter((application) => application.status === "submitted").length}</strong></article>
          <article><span>Under review</span><strong>{applications.filter((application) => application.status === "under-review").length}</strong></article>
          <article><span>Approved</span><strong>{applications.filter((application) => application.status === "approved").length}</strong></article>
          <article><span>Rejected</span><strong>{applications.filter((application) => application.status === "rejected").length}</strong></article>
        </div>

        <section className="asftbi-applications-list" aria-label="Startup applications">
          <div className="asftbi-applications-toolbar">
            <label className="asftbi-applications-search"><Search size={16} /><span className="asftbi-visually-hidden">Search applications</span><input value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Search applicant, startup, email or ID" /></label>
            <label>Status
              <select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}>
                <option value="all">All statuses</option>
                {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
            </label>
            <label>From <input className="asftbi-date-filter" type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setPage(1); setDateFrom(event.target.value); }} /></label>
            <label>To <input className="asftbi-date-filter" type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setPage(1); setDateTo(event.target.value); }} /></label>
            <span className="asftbi-applications-count">{visibleApplications.length} results</span>
          </div>

          {error && <p className="asftbi-applications-error" role="alert">{error}</p>}
          {loading && <p className="asftbi-applications-empty">Loading startup applications…</p>}
          {!loading && !error && visibleApplications.length === 0 && <p className="asftbi-applications-empty">No startup applications match these filters.</p>}

          {!loading && pageApplications.map((application) => (
            <article className="asftbi-application-record" key={application.id}>
              <div className="asftbi-application-record-top">
                <div><span className={`asftbi-status-badge asftbi-status-${application.status}`}>{statusLabels[application.status]}</span><span className="asftbi-application-id">{application.id}</span></div>
                <time dateTime={application.submittedAt}>{formatDate(application.submittedAt)}</time>
              </div>
              <div className="asftbi-application-record-heading">
                <div><h2>{application.startupName}</h2><p>{application.industry} <i>·</i> {application.stage} <i>·</i> {application.teamSize} {application.teamSize === 1 ? "team member" : "team members"}</p></div>
                <label className="asftbi-status-control">Application status
                  <select value={application.status} disabled={savingId === application.id} onChange={(event) => {
                    if (isAsfTbiApplicationStatus(event.target.value)) {
                      void updateApplication(application, { status: event.target.value });
                    }
                  }}>
                    {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                </label>
              </div>

              <div className="asftbi-applicant-contact">
                <span><Users size={15} />{application.founderName}</span>
                <a href={`mailto:${application.email}`}><Mail size={15} />{application.email}</a>
                <a href={`tel:${application.phone}`}><Phone size={15} />{application.phone}</a>
                <span><MapPin size={15} />{application.city}</span>
                {application.website && <a href={application.website} target="_blank" rel="noreferrer">Website <ExternalLink size={14} /></a>}
              </div>

              <details className="asftbi-application-details">
                <summary>Application details, submitted answers & history <span>Submitted {new Date(application.submittedAt).toLocaleDateString("en-IN")}</span></summary>
                <div className="asftbi-application-answers">
                  <div><strong>Problem</strong><p>{application.problem || "Not provided"}</p></div>
                  <div><strong>Proposed solution</strong><p>{application.solution || "Not provided"}</p></div>
                  <div><strong>What makes the approach distinctive?</strong><p>{application.description || "Not provided"}</p></div>
                  <div><strong>Progress so far</strong><p>{application.traction || "Not provided"}</p></div>
                  <div><strong>Support requested</strong><p>{application.supportNeeds || "Not provided"}</p></div>
                  <div><strong>Pitch deck / supporting document</strong><p>{application.pitchDeckUrl ? <a href={application.pitchDeckUrl} target="_blank" rel="noreferrer">Open supporting document <ExternalLink size={13} /></a> : "Not provided"}</p></div>
                  {Object.entries(application.customFields ?? {}).map(([fieldId, answer]) => <div key={fieldId}><strong>{answer.label}</strong><p>{answer.value || "Not provided"}</p></div>)}
                </div>
                <div className="asftbi-admin-remarks">
                  <label htmlFor={`remarks-${application.id}`}>Internal admin remarks</label>
                  <textarea id={`remarks-${application.id}`} maxLength={5_000} value={remarksDrafts[application.id] ?? application.adminRemarks ?? ""} onChange={(event) => setRemarksDrafts((previous) => ({ ...previous, [application.id]: event.target.value }))} placeholder="Add private notes for this application" />
                  <button type="button" disabled={savingId === application.id || (remarksDrafts[application.id] ?? "") === (application.adminRemarks ?? "")} onClick={() => void updateApplication(application, { adminRemarks: remarksDrafts[application.id] ?? "" })}>
                    {savingId === application.id ? "Saving…" : "Save remarks"}
                  </button>
                </div>
                <div className="asftbi-application-history">
                  <strong>Application history</strong>
                  {application.history?.length ? <ol>{[...application.history].reverse().map((entry, index) => <li key={`${entry.changedAt}-${index}`}><span>{historySummary(entry)}</span><time dateTime={entry.changedAt}>{formatDate(entry.changedAt)}</time>{entry.action === "remarks_updated" && entry.remark && <p>{entry.remark}</p>}</li>)}</ol> : <p>No administrative changes recorded.</p>}
                </div>
              </details>
            </article>
          ))}

          {!loading && visibleApplications.length > 0 && <nav className="asftbi-pagination" aria-label="Application pages">
            <span>Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, visibleApplications.length)} of {visibleApplications.length}</span>
            <div>
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} />Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next<ChevronRight size={16} /></button>
            </div>
          </nav>}
        </section>
      </main>
    </AdminShell>
  );
}
