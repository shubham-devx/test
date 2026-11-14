"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { shouldBypassImageOptimization } from "@/lib/siteImage";

type CentreCard = {
  name: string;
  focus: string;
  description: string;
  href: string;
  image: string;
};

const CENTRES_PER_PAGE = 3;
const AUTOPLAY_INTERVAL = 6000;

export default function CoeCentreCarousel({ centres }: { centres: CentreCard[] }) {
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pageCount = Math.ceil(centres.length / CENTRES_PER_PAGE);
  const visibleCentres = centres.slice(
    activePage * CENTRES_PER_PAGE,
    (activePage + 1) * CENTRES_PER_PAGE,
  );

  useEffect(() => {
    if (isPaused || pageCount <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActivePage((currentPage) => (currentPage + 1) % pageCount);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [isPaused, pageCount]);

  function showPage(page: number) {
    setActivePage((page + pageCount) % pageCount);
  }

  return (
    <div className="coe-centre-carousel" role="region" aria-label="Centres of Excellence" aria-roledescription="carousel">
      <div className="coe-centre-grid" aria-live="off">
        {visibleCentres.map((centre, index) => {
          const centreNumber = activePage * CENTRES_PER_PAGE + index + 1;
          return (
            <Link className="coe-centre-card" href={centre.href} key={centre.name}>
              <span className="coe-card-image">
                <Image
                  src={centre.image}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  unoptimized={shouldBypassImageOptimization(centre.image)}
                />
                <span className="coe-card-focus">{centre.focus}</span>
                <span className="coe-card-number">{String(centreNumber).padStart(2, "0")}</span>
              </span>
              <span className="coe-card-copy">
                <strong className="coe-card-title">{centre.name}</strong>
                <span className="coe-card-description">{centre.description}</span>
                <span className="coe-card-footer">
                  View centre details <ChevronRight size={17} aria-hidden="true" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="coe-carousel-controls" role="group" aria-label="Centre pages">
          <button
            type="button"
            className="coe-carousel-arrow"
            onClick={() => showPage(activePage - 1)}
            aria-label="Show previous centres"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="coe-carousel-pages">
            {Array.from({ length: pageCount }, (_, page) => (
              <button
                type="button"
                className={`coe-carousel-dot${page === activePage ? " is-active" : ""}`}
                onClick={() => showPage(page)}
                aria-label={`Show centres ${page * CENTRES_PER_PAGE + 1} to ${Math.min((page + 1) * CENTRES_PER_PAGE, centres.length)}`}
                aria-current={page === activePage ? "true" : undefined}
                key={page}
              />
            ))}
          </div>
          <button
            type="button"
            className="coe-carousel-arrow"
            onClick={() => showPage(activePage + 1)}
            aria-label="Show next centres"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="coe-carousel-toggle"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? "Resume automatic slide" : "Pause automatic slide"}
          >
            {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            {isPaused ? "Play" : "Pause"}
          </button>
        </div>
      )}
    </div>
  );
}
