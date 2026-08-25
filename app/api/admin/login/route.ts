import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
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