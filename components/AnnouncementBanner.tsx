"use client";

import { useEffect, useRef, useState, type DetailedHTMLProps, type HTMLAttributes } from "react";
import { Megaphone, X } from "lucide-react";

// The <marquee> tag isn't in React's built-in JSX types (it's a legacy,
// non-standard HTML element), so we declare it ourselves to use it in TSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        behavior?: "scroll" | "slide" | "alternate";
        direction?: "left" | "right" | "up" | "down";
        scrollamount?: number;
        scrolldelay?: number;
        loop?: number;
      };
    }
  }
}

type Announcement = {
  enabled: boolean;
  text: string;
  linkText?: string;
  linkUrl?: string;
  style: "info" | "urgent";
};

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const marqueeRef = useRef<HTMLElement & { start?: () => void; stop?: () => void }>(null);

  useEffect(() => {
    fetch("/api/announcement")
      .then((res) => res.json())
      .then((data) => setAnnouncement(data))
      .catch(() => setAnnouncement(null));
  }, []);

  if (!announcement || !announcement.enabled || !announcement.text.trim() || dismissed) {
    return null;
  }

  const isUrgent = announcement.style === "urgent";
  const bg = isUrgent
    ? "linear-gradient(90deg, #5d1621, #7b1e2b, #5d1621)"
    : "linear-gradient(90deg, #b8631f, #d9822b, #b8631f)";

  const hasLink = Boolean(announcement.linkUrl?.trim());

  const text = (
    <>
      {announcement.text}
      {hasLink && announcement.linkText && (
        <span className="asf-announce-link">&nbsp;&nbsp;{announcement.linkText} →</span>
      )}
    </>
  );

  const inner = (
    <>
      <BannerStyles />
      <span className="asf-announce-badge">
        <span className="asf-announce-dot" />
        <Megaphone size={12} />
        New
      </span>

      <marquee
        ref={marqueeRef}
        className="asf-announce-marquee"
        behavior="scroll"
        direction="left"
        scrollamount={5}
        onMouseEnter={() => marqueeRef.current?.stop?.()}
        onMouseLeave={() => marqueeRef.current?.start?.()}
      >
        {text}
      </marquee>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDismissed(true);
        }}
        aria-label="Dismiss announcement"
        className="asf-announce-close"
      >
        <X size={13} />
      </button>
    </>
  );

  return hasLink ? (
    <a href={announcement.linkUrl} className="asf-announce-wrap asf-announce-wrap-link" style={{ background: bg }}>
      {inner}
    </a>
  ) : (
    <div className="asf-announce-wrap" style={{ background: bg }}>
      {inner}
    </div>
  );
}

function BannerStyles() {
  return (
    <style>{`
      .asf-announce-wrap {
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 9px 44px 9px 14px;
        color: #fff;
        overflow: hidden;
        text-decoration: none;
      }
      .asf-announce-wrap-link {
        cursor: pointer;
      }
      .asf-announce-wrap-link:hover {
        filter: brightness(1.06);
      }
      .asf-announce-badge {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.16);
        border: 1px solid rgba(255,255,255,0.35);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        white-space: nowrap;
        color: #fff;
      }
      .asf-announce-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #fff;
        animation: asf-pulse 1.6s infinite;
        flex: none;
      }
      @keyframes asf-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }
        70%  { box-shadow: 0 0 0 7px rgba(255,255,255,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
      }
      .asf-announce-marquee {
        flex: 1;
        color: #fff;
        font-size: 13.5px;
        font-weight: 600;
      }
      .asf-announce-link {
        color: #fff;
        font-weight: 800;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .asf-announce-close {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.14);
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        flex: none;
      }
      .asf-announce-close:hover {
        background: rgba(255,255,255,0.28);
      }
      @media (max-width: 640px) {
        .asf-announce-wrap { padding: 8px 38px 8px 10px; gap: 10px; }
        .asf-announce-badge { display: none; }
      }
    `}</style>
  );
}
