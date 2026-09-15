import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken } from "@/lib/adminAuth";
import { allowRequest, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    if (!allowRequest(`admin-login:${getClientIdentifier(req)}`, 5, 15 * 60_000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 15 minutes and try again." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }

    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        {
          error:
            "Admin panel is not configured. Add ADMIN_PASSWORD to .env.local.",
        },
        { status: 500 }
      );
    }

    if (typeof password !== "string" || password !== adminPassword) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  } catch (err) {
    console.error("admin login error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}