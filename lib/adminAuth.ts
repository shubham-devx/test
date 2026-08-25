/**
 * Lightweight admin session handling — no database, no session store.
 * The "session" is just a signed, expiring token stored in an httpOnly
 * cookie: {expiryTimestamp}.{HMAC-SHA256 of expiryTimestamp}.
 *
 * Uses the Web Crypto API (crypto.subtle) instead of Node's "crypto"
 * module because this file is imported by middleware.ts, which runs on
 * the Edge runtime — Node's crypto module isn't available there, but
 * Web Crypto is available in both Edge and Node.
 */

export const ADMIN_COOKIE_NAME = "asf_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to .env.local (any long random string)."
    );
  }
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const key = await getKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${toHex(signatureBuffer)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expires = Number(payload);
  if (Number.isNaN(expires) || Date.now() > expires) return false;

  const key = await getKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expected = toHex(signatureBuffer);

  if (expected.length !== signature.length) return false;

  // Constant-time comparison to avoid leaking info via timing.
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}