import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_CONTENT, isSiteContent } from "../lib/siteContent";
import { isValidSiteImageUrl, normalizeIndustryImageUrl, shouldBypassImageOptimization } from "../lib/siteImage";

describe("homepage news and events", () => {
  it("accepts complete stories and incomplete admin drafts with safe image paths", () => {
    const content = structuredClone(DEFAULT_SITE_CONTENT);
    content.homepage.recentNewsEvents = [
      {
        id: "event-1",
        title: "Industry award",
        date: "14 November 2026",
        description: "ASF received an industry recognition.",
        image: "/images/hero/asf-main.jpg",
      },
      { id: "event-draft", title: "", date: "", description: "", image: "" },
    ];

    expect(isSiteContent(content)).toBe(true);
  });

  it("rejects unsafe image URLs and duplicate event IDs", () => {
    const content = structuredClone(DEFAULT_SITE_CONTENT);
    const event = {
      id: "event-1",
      title: "Industry award",
      date: "",
      description: "ASF received an industry recognition.",
      image: "https://example.com/image.jpg",
    };
    content.homepage.recentNewsEvents = [event];
    expect(isSiteContent(content)).toBe(false);

    content.homepage.recentNewsEvents = [
      { ...event, image: "/images/hero/asf-main.jpg" },
      { ...event, title: "Second event", image: "/images/hero/asf-training.jpg" },
    ];
    expect(isSiteContent(content)).toBe(false);
  });
});

describe("homepage image URLs", () => {
  it("requires a safe image for every homepage and centre photo slot", () => {
    const invalidHomepageSlide = structuredClone(DEFAULT_SITE_CONTENT);
    invalidHomepageSlide.images.heroSlides[0] = "https://example.com/hero.webp";
    expect(isSiteContent(invalidHomepageSlide)).toBe(false);

    const invalidHighlight = structuredClone(DEFAULT_SITE_CONTENT);
    invalidHighlight.homepage.glanceMetrics[0].image = "https://example.com/highlight.webp";
    expect(isSiteContent(invalidHighlight)).toBe(false);

    const invalidAboutPhoto = structuredClone(DEFAULT_SITE_CONTENT);
    invalidAboutPhoto.about.keyFocusAreas[0].image = "https://example.com/about.webp";
    expect(isSiteContent(invalidAboutPhoto)).toBe(false);

    const invalidCentrePhoto = structuredClone(DEFAULT_SITE_CONTENT);
    invalidCentrePhoto.centresList[0].image = "https://example.com/centre.webp";
    expect(isSiteContent(invalidCentrePhoto)).toBe(false);
  });

  it("accepts local image paths", () => {
    expect(isValidSiteImageUrl("/images/hero/asf-main.jpg")).toBe(true);
    expect(isValidSiteImageUrl("/api/site-content/images/uploads/site-content/hero.webp")).toBe(true);
    expect(isValidSiteImageUrl(
      "/api/site-content/images/uploads/site-content/homepage-photo-123e4567-e89b-42d3-a456-426614174000.webp"
    )).toBe(true);
    expect(isValidSiteImageUrl(
      "/api/site-content/images/uploads/site-content/centre-photo-123e4567-e89b-42d3-a456-426614174000.webp"
    )).toBe(true);
  });

  it("accepts uploaded images from the configured Vercel Blob host", () => {
    expect(isValidSiteImageUrl(
      "https://store.public.blob.vercel-storage.com/uploads/site-content/hero.webp"
    )).toBe(true);
  });

  it("rejects external, insecure and protocol-relative URLs", () => {
    expect(isValidSiteImageUrl("https://example.com/image.webp")).toBe(false);
    expect(isValidSiteImageUrl("http://store.public.blob.vercel-storage.com/image.webp")).toBe(false);
    expect(isValidSiteImageUrl("//example.com/image.webp")).toBe(false);
  });

  it("loads private uploaded images directly instead of through the Next image optimizer", () => {
    expect(shouldBypassImageOptimization(
      "/api/site-content/images/uploads/site-content/industry-123e4567-e89b-42d3-a456-426614174000.webp"
    )).toBe(true);
    expect(shouldBypassImageOptimization(
      "https://store.public.blob.vercel-storage.com/uploads/site-content/industry.webp"
    )).toBe(true);
    expect(shouldBypassImageOptimization("/images/industry/industrial-services.jpg")).toBe(false);
  });

  it("normalizes the legacy uppercase Industry photo extension for case-sensitive hosting", () => {
    expect(normalizeIndustryImageUrl("/images/industry/industrial-services.JPG"))
      .toBe("/images/industry/industrial-services.jpg");
    expect(normalizeIndustryImageUrl("/images/industry/industrial-services.jpg"))
      .toBe("/images/industry/industrial-services.jpg");
    expect(normalizeIndustryImageUrl("/api/site-content/images/uploads/site-content/industry.webp"))
      .toBe("/api/site-content/images/uploads/site-content/industry.webp");
  });
});
