"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Megaphone, X } from "lucide-react";

type Announcement = {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
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

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcement", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setAnnouncement(data))
      .catch(() => setAnnouncement(null));
  }, []);

  if (!announcement || !announcement.enabled || !announcement.text.trim() || dismissed) {
    return null;
  }

  const isUrgent = announcement.style === "urgent";
  const linkUrl = safeAnnouncementUrl(announcement.linkUrl);
  const linkText = announcement.linkText?.trim();

  return (
    <aside className={`announcement-banner ${isUrgent ? "urgent" : "info"}`} aria-label="Site announcement" aria-live="polite">
      <div className="announcement-banner-inner">
        <div className="announcement-banner-label">
          <span className="announcement-banner-icon"><Megaphone size={17} /></span>
          <span>{isUrgent ? "Important notice" : "Foundation update"}</span>
        </div>
        <div className="announcement-banner-message" aria-label="Announcement message">
          <div
            className="announcement-banner-track"
            style={{ animationDuration: `${Math.max(26, announcement.text.length * 0.55 + 12)}s` }}
            aria-hidden="true"
          >
            <span>{announcement.text}</span>
            <span>{announcement.text}</span>
          </div>
          <span className="announcement-banner-sr-only">{announcement.text}</span>
        </div>
        {linkUrl && linkText && (
          <a className="announcement-banner-action" href={linkUrl}>
            {linkText}<ArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
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
