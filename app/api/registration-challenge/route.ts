import { NextRequest, NextResponse } from "next/server";
import { createRegistrationChallenge } from "@/lib/registrationChallenge";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!allowRequest(`registration-challenge:${getClientIdentifier(request)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many challenge requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    return NextResponse.json(createRegistrationChallenge(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("registration challenge error:", error);
    return NextResponse.json({ error: "Registration security check is unavailable." }, { status: 503 });
  }
}
