"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone, Pause, Play, X } from "lucide-react";

type Announcement = {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  reviewDate?: string;
  style: "info" | "urgent";
};

function safeAnnouncementUrl(value?: string): string {
  const href = value?.trim() ?? "";
  if (href.startsWith("#") || (href.startsWith("/") && !href.startsWith("//"))) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function formatReviewDate(value?: string): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [paused, setPaused] = useState(true);
  const [marquee, setMarquee] = useState<HTMLMarqueeElement | null>(null);

  useEffect(() => {
    fetch("/api/announcement", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setAnnouncement(data))
      .catch(() => setAnnouncement(null));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPaused(reducedMotion.matches);
    updateMotionPreference();
    reducedMotion.addEventListener("change", updateMotionPreference);
    return () => reducedMotion.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (!marquee) return;
    if (paused) marquee.stop();
    else marquee.start();
  }, [marquee, paused]);

  if (!announcement || !announcement.enabled || !announcement.text.trim() || dismissed) {
    return null;
  }

  const isUrgent = announcement.style === "urgent";
  const linkUrl = safeAnnouncementUrl(announcement.linkUrl);
  const linkText = announcement.linkText?.trim();
  const reviewDate = formatReviewDate(announcement.reviewDate);

  return (
    <aside className={`announcement-banner ${isUrgent ? "urgent" : "info"}`} aria-label="Site announcement" aria-live="polite">
      <div className="announcement-banner-inner">
        <div className="announcement-banner-label">
          <span className="announcement-banner-icon"><Megaphone size={17} /></span>
          <span>{isUrgent ? "Important notice" : "Foundation update"}</span>
        </div>
        <marquee
          ref={setMarquee}
          className="announcement-banner-message"
          behavior="scroll"
          direction="left"
          scrollAmount={4}
          aria-label="Announcement message"
          aria-live="off"
        >
          {announcement.text}
        </marquee>
        <div className="announcement-banner-meta">
          {linkUrl && linkText && (
            <a className="announcement-banner-action" href={linkUrl}>
              {linkText}<ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
          {reviewDate && <span className="announcement-banner-review">Review by {reviewDate}</span>}
        </div>
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Resume announcement" : "Pause announcement"}
          aria-pressed={paused}
          className="announcement-banner-pause"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="announcement-banner-close"
        >
          <X size={17} />
        </button>
      </div>
    </aside>
  );
}
