import { describe, expect, it } from "vitest";
import { isValidSiteImageUrl, normalizeIndustryImageUrl, shouldBypassImageOptimization } from "../lib/siteImage";

describe("homepage image URLs", () => {
  it("accepts local image paths", () => {
    expect(isValidSiteImageUrl("/images/hero/asf-main.jpg")).toBe(true);
    expect(isValidSiteImageUrl("/api/site-content/images/uploads/site-content/hero.webp")).toBe(true);
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
