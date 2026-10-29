import crypto from "crypto";

const CHALLENGE_TTL_MS = 10 * 60_000;

export type RegistrationChallenge = {
  a: number;
  b: number;
  ticket: string;
};

function getSigningSecret(): string {
  const secret = process.env.REGISTRATION_CHALLENGE_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("REGISTRATION_CHALLENGE_SECRET or ADMIN_SESSION_SECRET must be configured.");
  return secret;
}

export function createRegistrationChallenge(): RegistrationChallenge {
  const a = crypto.randomInt(2, 10);
  const b = crypto.randomInt(1, 9);
  const issuedAt = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${a}.${b}.${nonce}`;
  const signature = crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return { a, b, ticket: `${payload}.${signature}` };
}

export function verifyRegistrationChallenge(ticket: unknown, answer: unknown): { valid: boolean; nonce?: string } {
  if (typeof ticket !== "string" || ticket.length > 200 || typeof answer !== "string") {
    return { valid: false };
  }

  const parts = ticket.split(".");
  if (parts.length !== 5) return { valid: false };
  const [issuedAtText, aText, bText, nonce, signature] = parts;
  if (!/^\d+$/.test(issuedAtText) || !/^\d+$/.test(aText) || !/^\d+$/.test(bText)) {
    return { valid: false };
  }
  if (!/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) return { valid: false };

  const issuedAt = Number(issuedAtText);
  const a = Number(aText);
  const b = Number(bText);
  if (!Number.isSafeInteger(issuedAt) || Date.now() - issuedAt > CHALLENGE_TTL_MS || issuedAt > Date.now() + 30_000) {
    return { valid: false };
  }
  if (!Number.isInteger(a) || a < 2 || a > 9 || !Number.isInteger(b) || b < 1 || b > 8) {
    return { valid: false };
  }
  if (!/^\d{1,2}$/.test(answer) || Number(answer) !== a + b) return { valid: false };

  const payload = `${issuedAt}.${a}.${b}.${nonce}`;
  const expected = crypto.createHmac("sha256", getSigningSecret()).update(payload).digest();
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return { valid: false };

  return { valid: true, nonce };
}
