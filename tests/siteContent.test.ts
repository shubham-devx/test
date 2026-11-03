import { describe, expect, it } from "vitest";
import { isValidSiteImageUrl } from "../lib/siteImage";

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
});
