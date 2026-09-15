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

async function razorpayGet<T>(url: string, keyId: string, keySecret: string): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1/${url}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) throw new Error("Razorpay verification request failed");
  return data as T;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      durationLabel,
      responses,
    } = body ?? {};

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      typeof courseId !== "string" ||
      typeof durationLabel !== "string" ||
      razorpay_order_id.length > 120 ||
      razorpay_payment_id.length > 120 ||
      razorpay_signature.length !== 64 ||
      courseId.length > 120 ||
      durationLabel.length > 120
    ) {
      return NextResponse.json(
        { error: "Incomplete payment verification data." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
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

    const actualSignature = Buffer.from(razorpay_signature, "hex");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
    if (
      actualSignature.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(actualSignature, expectedSignatureBuffer)
    ) {
      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    const course = await findCourse(courseId);
    const duration = await findDuration(courseId, durationLabel);

    if (!course || !duration) {
      return NextResponse.json(
        { error: "Invalid course selection." },
        { status: 400 }
      );
    }

    type RazorpayOrder = {
      amount: number;
      currency: string;
      notes?: { courseId?: string; durationLabel?: string };
    };
    type RazorpayPayment = {
      order_id: string;
      amount: number;
      currency: string;
      status: string;
    };

    const [order, payment] = await Promise.all([
      razorpayGet<RazorpayOrder>(
        `orders/${encodeURIComponent(razorpay_order_id)}`,
        keyId,
        keySecret
      ),
      razorpayGet<RazorpayPayment>(
        `payments/${encodeURIComponent(razorpay_payment_id)}`,
        keyId,
        keySecret
      ),
    ]);

    const expectedAmount = duration.fee * 100;
    if (
      order.amount !== expectedAmount ||
      order.currency !== "INR" ||
      (order.notes?.courseId && order.notes.courseId !== courseId) ||
      (order.notes?.durationLabel && order.notes.durationLabel !== durationLabel) ||
      payment.order_id !== razorpay_order_id ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return NextResponse.json(
        { error: "Payment details could not be verified." },
        { status: 400 }
      );
    }

    const registrationId = generateRegistrationId(course.id);

    // Every answer from the (fully dynamic) registration form, keyed by
    // field id. Whatever fields exist at submission time end up here —
    // course/duration/captcha are excluded since they're tracked separately.
    const cleanResponses: Record<string, string> = {};
    if (responses && typeof responses === "object") {
      for (const [key, value] of Object.entries(responses)) {
        if (["course", "duration", "captcha"].includes(key)) continue;
        cleanResponses[key] = String(value ?? "").trim().slice(0, 500);
      }
    }

    const record = {
      registrationId,
      responses: cleanResponses,
      course: course.name,
      duration: duration.label,
      amount: duration.fee,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      registeredAt: new Date().toISOString(),
      status: "new",
    };

    // --- File-based storage (stand-in for a database) -------------------
    // NOTE: this only persists on a normal always-on Node server (VPS,
    // Railway, Render, `next start`, etc). On serverless platforms (e.g.
    // Vercel) the filesystem is read-only/ephemeral at runtime, and this
    // file will NOT persist between requests.
    await fs.mkdir(DATA_DIR, { recursive: true });

    let existing: unknown[] = [];
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      existing = Array.isArray(parsed) ? parsed : [];
    } catch {
      existing = [];
    }

    const duplicate = existing.find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ((item as { paymentId?: string }).paymentId === razorpay_payment_id ||
          (item as { orderId?: string }).orderId === razorpay_order_id)
    ) as { registrationId?: string } | undefined;

    if (duplicate?.registrationId) {
      return NextResponse.json({ success: true, registrationId: duplicate.registrationId });
    }

    existing.push(record);
    await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), "utf-8");

    return NextResponse.json({ success: true, registrationId });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { error: "Something went wrong while verifying the payment." },
      { status: 500 }
    );
  }
}