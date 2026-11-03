"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

export default function AsfTbiCarousel({ label, children, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paginationIndexes, setPaginationIndexes] = useState([0]);
  const [activePage, setActivePage] = useState(0);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const items = Children.toArray(children);

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children);
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollBack(track.scrollLeft > 2);
    setCanScrollForward(maxScroll - track.scrollLeft > 2);

    const firstCard = cards[0] as HTMLElement | undefined;
    if (firstCard) {
      const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
      const cardStep = cards.length > 1
        ? (cards[1] as HTMLElement).getBoundingClientRect().left - firstCard.getBoundingClientRect().left
        : firstCard.offsetWidth + gap;
      const visibleCount = Math.max(1, Math.floor((track.clientWidth + gap) / Math.max(cardStep, 1)));
      const finalStart = Math.max(0, cards.length - visibleCount);
      const starts = Array.from(
        { length: Math.ceil(finalStart / visibleCount) + 1 },
        (_, page) => Math.min(page * visibleCount, finalStart)
      ).filter((index, page, indexes) => page === 0 || index !== indexes[page - 1]);
      setPaginationIndexes((previous) =>
        previous.length === starts.length && previous.every((index, page) => index === starts[page])
          ? previous
          : starts
      );

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const distance = Math.abs((card as HTMLElement).getBoundingClientRect().left - track.getBoundingClientRect().left);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      setActivePage(starts.reduce((page, start, index) => nearestIndex >= start ? index : page, 0));
    }

  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updatePosition);
    };
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(track);
    track.addEventListener("scroll", scheduleUpdate, { passive: true });
    scheduleUpdate();
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      track.removeEventListener("scroll", scheduleUpdate);
    };
  }, [items.length, updatePosition]);

  function scrollTo(index: number) {
    const track = trackRef.current;
    const card = track?.children.item(index);
    if (track && card instanceof HTMLElement) {
      const left = track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      track.scrollTo({ left, behavior });
    }
  }

  function scrollByCard(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !(card instanceof HTMLElement)) return;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    track.scrollBy({ left: direction * (card.offsetWidth + gap), behavior });
  }

  return (
    <div className={`tbi-carousel ${className}`.trim()} role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="tbi-carousel-controls">
        <button type="button" onClick={() => scrollByCard(-1)} disabled={!canScrollBack} aria-label={`Previous ${label.toLowerCase()}`}>
          <ChevronLeft size={20} />
        </button>
        <button type="button" onClick={() => scrollByCard(1)} disabled={!canScrollForward} aria-label={`Next ${label.toLowerCase()}`}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="tbi-carousel-track" ref={trackRef} tabIndex={0} aria-label={`${label} items`}>
        {items.map((item, index) => (
          <div className="tbi-carousel-item" key={index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}`}>{item}</div>
        ))}
      </div>
      {paginationIndexes.length > 1 && (
        <div className="tbi-carousel-dots" role="group" aria-label={`${label} pagination`}>
          {paginationIndexes.map((itemIndex, index) => (
            <button
              type="button"
              key={itemIndex}
              onClick={() => scrollTo(itemIndex)}
              className={index === activePage ? "active" : ""}
              aria-label={`Show ${label.toLowerCase()} ${index + 1}`}
              aria-current={index === activePage ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
