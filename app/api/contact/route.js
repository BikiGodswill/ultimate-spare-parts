/**
 * app/api/contact/route.js
 * POST /api/contact — send contact form submissions to support email.
 */

import { NextResponse } from "next/server";
import { sendEmail } from "@/services/emailService";
import { validateEmail } from "@/utils/validators";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || "bikigodswill25@gmail.com";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.trim();
    const subject = body.subject?.trim();
    const message = body.message?.trim();
    const orderId = body.orderId?.trim() || "N/A";

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please provide your name, email, subject, and message." },
        { status: 400 },
      );
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const text = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nOrder ID: ${orderId}\nSubject: ${subject}\n\nMessage:\n${message}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #111; line-height:1.6;">
        <h1 style="font-size: 20px; margin-bottom: 12px;">New contact form submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top: 16px; padding: 14px; border-radius: 12px; background: #f8f8f8;">
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `Contact form: ${subject}`,
      text,
      html,
      replyTo: email,
    });

    if (result.success || result.skipped) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || "Failed to send contact request." },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Server error while sending contact request." },
      { status: 500 },
    );
  }
}
