export function isValidSiteImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return !value.includes("\\");

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "public.blob.vercel-storage.com" ||
        url.hostname.endsWith(".public.blob.vercel-storage.com"));
  } catch {
    return false;
  }
}
