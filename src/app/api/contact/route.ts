import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Reject oversized request bodies (limit request size). */
const MAX_BODY_BYTES = 20_000;

/** Escape user content before it is interpolated into email HTML. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip markup/control chars and cap length (sanitize before storing/sending). */
function sanitize(value: string, maxLen: number) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, maxLen);
}

export async function POST(req: Request) {
  try {
    // --- CSRF / same-origin guard -------------------------------------
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- Body size limit + strict JSON parsing ------------------------
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = sanitize(typeof payload.email === "string" ? payload.email : "", 254).toLowerCase();
    const name = sanitize(typeof payload.name === "string" ? payload.name : "", 120);
    const message = sanitize(typeof payload.message === "string" ? payload.message : "", 5000);
    const rawUtm = payload.utm;
    const utm =
      rawUtm && typeof rawUtm === "object" && !Array.isArray(rawUtm)
        ? (rawUtm as Record<string, unknown>)
        : {};

    if (!email || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // --- Rate limit (per IP) ------------------------------------------
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { data: isAllowed, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      {
        p_identifier: clientIp,
        p_action: "send_lead_email",
        p_max_count: 5,
        p_window_seconds: 3600,
      }
    );

    if (rateLimitError) throw rateLimitError;
    if (!isAllowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // --- Send notification to admin -----------------------------------
    const utmRows = Object.entries(utm)
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(
        ([key, value]) =>
          `<p style="margin:2px 0;"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(
            String(value)
          )}</p>`
      )
      .join("");

    const adminHtml = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      ${utmRows ? `<p style="margin-top:12px;"><strong>Campaign source:</strong></p>${utmRows}` : ""}
    `;

    const adminRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "HKH", email: "hkh034553@gmail.com" },
        to: [{ email: "hasanshahirconnect@gmail.com", name: "Admin" }],
        subject: `New Contact Submission from ${escapeHtml(name)}`,
        htmlContent: adminHtml,
      }),
    });

    // --- Send auto-reply to the client --------------------------------
    const clientRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "HKH", email: "hkh034553@gmail.com" },
        to: [{ email: email, name: name }],
        subject: "We've received your inquiry!",
        htmlContent: `
          <div style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h2 style="color: #222;">Hi ${escapeHtml(name)},</h2>
            <p>Thank you for reaching out to us. We have successfully received your inquiry and our team will get back to you shortly.</p>
            <br/>
            <p>Best regards,<br/><strong>The HKH Team</strong></p>
          </div>
        `,
      }),
    });

    const adminData = await adminRes.json();
    const clientData = await clientRes.json();

    if (!adminRes.ok || !clientRes.ok) {
      return NextResponse.json(
        { error: "Failed to send emails", adminData, clientData },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
