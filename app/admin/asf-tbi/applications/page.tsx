"use client";

import "./applications.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone, RefreshCw, Search, Users } from "lucide-react";
import type { AsfTbiApplication, AsfTbiApplicationStatus } from "@/lib/asfTbiApplications";

const statuses: AsfTbiApplicationStatus[] = ["new", "reviewing", "shortlisted", "accepted", "declined"];
const statusLabels: Record<AsfTbiApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  declined: "Declined",
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AsfTbiApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<AsfTbiApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/asf-tbi/applications", { cache: "no-store" });
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load startup applications.");
      setApplications(data.applications);
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

  const refreshApplications = useCallback(() => {
    setLoading(true);
    setError("");
    void fetchApplications();
  }, [fetchApplications]);

  const visibleApplications = useMemo(() => {
    const search = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesQuery = !search || [
        application.id,
        application.founderName,
        application.email,
        application.startupName,
        application.industry,
        application.city,
      ].some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesQuery;
    });
  }, [applications, query, statusFilter]);

  async function updateStatus(application: AsfTbiApplication, status: AsfTbiApplicationStatus) {
    setUpdating(application.id);
    setError("");
    try {
      const response = await fetch("/api/admin/asf-tbi/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: application.id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update application status.");
      setApplications((previous) => previous.map((entry) => entry.id === application.id ? data.application : entry));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update application status.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <main className="asftbi-applications-page">
      <header className="asftbi-applications-header">
        <div>
          <Link href="/admin"><ArrowLeft size={16} /> Admin dashboard</Link>
          <span className="asftbi-applications-eyebrow">ASF-TBI · PRIVATE APPLICATIONS</span>
          <h1>Startup applications</h1>
          <p>Founder and venture details are only available here to signed-in administrators.</p>
        </div>
        <div className="asftbi-applications-header-actions">
          <Link href="/admin/asf-tbi">Edit website</Link>
          <button type="button" onClick={refreshApplications} disabled={loading}><RefreshCw size={15} /> Refresh</button>
        </div>
      </header>

      <div className="asftbi-applications-summary">
        <article><span>Total applications</span><strong>{applications.length}</strong></article>
        <article><span>New</span><strong>{applications.filter((application) => application.status === "new").length}</strong></article>
        <article><span>Reviewing</span><strong>{applications.filter((application) => application.status === "reviewing").length}</strong></article>
        <article><span>Shortlisted</span><strong>{applications.filter((application) => application.status === "shortlisted").length}</strong></article>
      </div>

      <section className="asftbi-applications-list">
        <div className="asftbi-applications-toolbar">
          <div className="asftbi-applications-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search founder, startup, email or ID" aria-label="Search startup applications" /></div>
          <label>Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All applications</option>
              {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </label>
          <span className="asftbi-applications-count">{visibleApplications.length} shown</span>
        </div>

        {error && <p className="asftbi-applications-error" role="alert">{error}</p>}
        {loading && <p className="asftbi-applications-empty">Loading startup applications…</p>}
        {!loading && !error && visibleApplications.length === 0 && <p className="asftbi-applications-empty">No startup applications match this search.</p>}

        {!loading && visibleApplications.map((application) => (
          <article className="asftbi-application-record" key={application.id}>
            <div className="asftbi-application-record-top">
              <div><span className={`asftbi-status-badge asftbi-status-${application.status}`}>{statusLabels[application.status]}</span><span className="asftbi-application-id">{application.id}</span></div>
              <time dateTime={application.submittedAt}>{formatDate(application.submittedAt)}</time>
            </div>
            <div className="asftbi-application-record-heading">
              <div><h2>{application.startupName}</h2><p>{application.industry} <i>·</i> {application.stage} <i>·</i> {application.teamSize} {application.teamSize === 1 ? "team member" : "team members"}</p></div>
              <label className="asftbi-status-control">Application status
                <select value={application.status} disabled={updating === application.id} onChange={(event) => void updateStatus(application, event.target.value as AsfTbiApplicationStatus)}>
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
              <summary>View startup details <span>Submitted {new Date(application.submittedAt).toLocaleDateString("en-IN")}</span></summary>
              <div className="asftbi-application-answers">
                <div><strong>Problem</strong><p>{application.problem}</p></div>
                <div><strong>Proposed solution</strong><p>{application.solution}</p></div>
                <div><strong>What makes the approach distinctive?</strong><p>{application.description}</p></div>
                <div><strong>Progress so far</strong><p>{application.traction || "Not provided"}</p></div>
                <div><strong>Support requested</strong><p>{application.supportNeeds}</p></div>
                <div><strong>Pitch deck</strong><p>{application.pitchDeckUrl ? <a href={application.pitchDeckUrl} target="_blank" rel="noreferrer">Open pitch deck <ExternalLink size={13} /></a> : "Not provided"}</p></div>
                {Object.entries(application.customFields).map(([fieldId, answer]) => <div key={fieldId}><strong>{answer.label}</strong><p>{answer.value || "Not provided"}</p></div>)}
              </div>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
}
