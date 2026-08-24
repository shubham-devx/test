import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { findCourse, findDuration } from "@/lib/courses";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "registrations.json");

function generateRegistrationId(courseId: string) {
  const year = new Date().getFullYear();
  const prefix = courseId.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ASF-${prefix}-${year}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrant,
    } = body ?? {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !registrant
    ) {
      return NextResponse.json(
        { error: "Incomplete payment verification data." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment gateway is not configured on the server." },
        { status: 500 }
      );
    }

    // This is the step that actually proves the payment is real: Razorpay
    // signs order_id + payment_id with your secret key. If someone tries to
    // fake a success screen without paying, this signature will not match.
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    const course = findCourse(registrant.courseId);
    const duration = findDuration(registrant.courseId, registrant.durationLabel);

    if (!course || !duration) {
      return NextResponse.json(
        { error: "Invalid course selection." },
        { status: 400 }
      );
    }

    const registrationId = generateRegistrationId(course.id);

    const record = {
      registrationId,
      name: String(registrant.name ?? "").trim(),
      phone: String(registrant.phone ?? "").trim(),
      designation: String(registrant.designation ?? "").trim(),
      location: String(registrant.location ?? "").trim(),
      institution: String(registrant.institution ?? "").trim(),
      dob: String(registrant.dob ?? "").trim(),
      course: course.name,
      duration: duration.label,
      amount: duration.fee,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      registeredAt: new Date().toISOString(),
    };

    // --- File-based storage (stand-in for a database) -------------------
    // NOTE: this only persists on a normal always-on Node server (VPS,
    // Railway, Render, a `next start` box, etc). On serverless platforms
    // (e.g. Vercel) the filesystem is read-only/ephemeral in production and
    // this file will NOT persist between requests. See README-PAYMENT-SETUP.md.
    await fs.mkdir(DATA_DIR, { recursive: true });

    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      existing = Array.isArray(parsed) ? parsed : [];
    } catch {
      existing = [];
    }

    existing.push(record);
    await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), "utf-8");

    return NextResponse.json({ success: true, registrationId, record });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { error: "Something went wrong while verifying the payment." },
      { status: 500 }
    );
  }
}