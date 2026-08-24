import { NextRequest, NextResponse } from "next/server";
import { findDuration } from "@/lib/courses";

// This route runs on the server only. process.env.RAZORPAY_KEY_SECRET is
// NEVER sent to the browser.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, durationLabel, name, phone } = body ?? {};

    if (!courseId || !durationLabel || !name || !phone) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Amount is looked up on the server from lib/courses.ts, NOT taken from
    // the request body. This is what makes the fee tamper-proof.
    const duration = findDuration(courseId, durationLabel);
    if (!duration) {
      return NextResponse.json(
        { error: "Invalid course or duration selected." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            "Payment gateway is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local.",
        },
        { status: 500 }
      );
    }

    const amountInPaise = duration.fee * 100;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `asf_${Date.now()}`,
        notes: { name, phone, courseId, durationLabel },
      }),
      cache: "no-store",
    });

    const order = await razorpayRes.json();

    if (!razorpayRes.ok) {
      return NextResponse.json(
        { error: order?.error?.description || "Could not create payment order." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating the order." },
      { status: 500 }
    );
  }
}