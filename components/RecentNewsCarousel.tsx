"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { HomepageNewsEvent } from "@/lib/siteContent";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

const AUTOPLAY_INTERVAL = 6000;

type PositionedEvent = {
  event: HomepageNewsEvent;
  position: "left" | "center" | "right";
};

function getVisibleEvents(events: HomepageNewsEvent[], activeIndex: number): PositionedEvent[] {
  if (events.length === 1) return [{ event: events[0], position: "center" }];
  if (events.length === 2) {
    return [
      { event: events[(activeIndex + 1) % events.length], position: "left" },
      { event: events[activeIndex], position: "center" },
    ];
  }

  return [
    { event: events[(activeIndex + events.length - 1) % events.length], position: "left" },
    { event: events[activeIndex], position: "center" },
    { event: events[(activeIndex + 1) % events.length], position: "right" },
  ];
}

export default function RecentNewsCarousel({ events }: { events: HomepageNewsEvent[] }) {
  const publishedEvents = events.filter((event) =>
    event.title.trim() && event.description.trim() && event.image.trim()
  );
  const [requestedIndex, setRequestedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeIndex = publishedEvents.length ? requestedIndex % publishedEvents.length : 0;

  useEffect(() => {
    if (
      isPaused ||
      publishedEvents.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setRequestedIndex((currentIndex) => (currentIndex + 1) % publishedEvents.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [isPaused, publishedEvents.length]);

  function showEvent(index: number) {
    setRequestedIndex((index + publishedEvents.length) % publishedEvents.length);
  }

  if (publishedEvents.length === 0) {
    return (
      <div className="recent-news-empty" role="status">
        <strong>News and event highlights are coming soon.</strong>
        <span>Check back for updates from ASF and its Centres of Excellence.</span>
      </div>
    );
  }

  return (
    <div
      className="recent-news-carousel"
      role="region"
      aria-label="Recent news and events"
      aria-roledescription="carousel"
    >
      <div className={`recent-news-stage${publishedEvents.length === 2 ? " has-two-events" : ""}`} aria-live="off">
        {getVisibleEvents(publishedEvents, activeIndex).map(({ event, position }) => {
          const index = publishedEvents.findIndex((entry) => entry.id === event.id);
          const isActive = index === activeIndex;
          return (
            <button
              type="button"
              className={`recent-news-card is-${position}${isActive ? " is-active" : ""}`}
              key={event.id}
              onClick={() => showEvent(index)}
              aria-pressed={isActive}
              aria-label={`Show event: ${event.title}`}
            >
              <Image
                src={event.image}
                alt=""
                fill
                sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw"
                unoptimized={shouldBypassImageOptimization(event.image)}
              />
              <span className="recent-news-card-copy">
                {event.date && <span className="recent-news-card-date">{event.date}</span>}
                <strong>{event.title}</strong>
                <span>{event.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {publishedEvents.length > 1 && (
        <div className="recent-news-controls" role="group" aria-label="News and events carousel controls">
          <button
            type="button"
            className="recent-news-arrow"
            onClick={() => showEvent(activeIndex - 1)}
            aria-label="Show previous event"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <div className="recent-news-dots">
            {publishedEvents.map((event, index) => (
              <button
                type="button"
                key={event.id}
                className={`recent-news-dot${index === activeIndex ? " is-active" : ""}`}
                onClick={() => showEvent(index)}
                aria-label={`Show event ${index + 1}: ${event.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            className="recent-news-arrow"
            onClick={() => showEvent(activeIndex + 1)}
            aria-label="Show next event"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="recent-news-toggle"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? "Resume automatic slide" : "Pause automatic slide"}
          >
            {isPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
            {isPaused ? "Play" : "Pause"}
          </button>
        </div>
      )}
    </div>
  );
}
