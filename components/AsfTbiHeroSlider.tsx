"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FocusEvent, TouchEvent } from "react";
import type { AsfTbiContent } from "@/lib/asfTbiContent";

type Props = {
  hero: AsfTbiContent["hero"];
  onApply: () => void;
};

export default function AsfTbiHeroSlider({ hero, onApply }: Props) {
  const slides = [hero.image, ...hero.slides.filter((slide) => slide !== hero.image)];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || isHovered || isFocused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 7_000);
    return () => window.clearInterval(timer);
  }, [isFocused, isHovered, reducedMotion, slides.length]);

  function moveSlide(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches.item(0);
    if (touchStart.current === null || !touch) return;
    const distance = touch.clientX - touchStart.current;
    if (Math.abs(distance) > 48) moveSlide(distance < 0 ? 1 : -1);
    touchStart.current = null;
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) setIsFocused(false);
  }

  return (
    <section
      className="tbi-hero"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={handleBlur}
      onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
      aria-label="ASF-TBI highlights"
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          className="tbi-hero-slide"
          key={slides[activeIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.8, ease: "easeInOut" }}
        >
          <Image
            src={slides[activeIndex]}
            alt=""
            fill
            sizes="100vw"
            preload={activeIndex === 0}
            loading={activeIndex === 0 ? undefined : "lazy"}
            unoptimized={slides[activeIndex].startsWith("https://")}
            className="tbi-hero-image"
          />
        </motion.div>
      </AnimatePresence>
      <div className="tbi-hero-shade" />
      <div className="tbi-container tbi-hero-inner">
        <motion.div className="tbi-hero-copy" initial={false} animate={{ opacity: 1, y: 0 }}>
          <span className="tbi-hero-kicker"><span />{hero.eyebrow}</span>
          <h1>{hero.title}<br /><em>{hero.highlight}</em></h1>
          <p>{hero.description}</p>
          <div className="tbi-hero-actions">
            <a className="tbi-button tbi-button-primary" href="#programs">{hero.primaryCta}<ArrowRight size={17} /></a>
            <button className="tbi-button tbi-button-glass" type="button" onClick={onApply}>{hero.secondaryCta}<ArrowUpRight size={16} /></button>
          </div>
          <a className="tbi-scroll-link" href="#about"><span>Discover ASF-TBI</span><ArrowDown size={16} /></a>
        </motion.div>
        <div className="tbi-hero-note"><Sparkles size={16} /> Ideas grow better together.</div>
        {slides.length > 1 && (
          <div className="tbi-hero-controls" role="group" aria-label="Hero image slides">
            <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous hero image"><ArrowLeft size={17} /></button>
            <div className="tbi-hero-dots">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={`${slide}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={index === activeIndex ? "active" : ""}
                  aria-label={`Show hero image ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
            <button type="button" onClick={() => moveSlide(1)} aria-label="Next hero image"><ArrowRight size={17} /></button>
          </div>
        )}
      </div>
    </section>
  );
}
