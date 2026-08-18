import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Reject oversized request bodies (limit request size). */
const MAX_BODY_BYTES = 150_000;

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

    const subject =
      typeof payload.subject === "string"
        ? payload.subject.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, 200)
        : "";
    const html =
      typeof payload.html === "string" ? payload.html.slice(0, 100_000) : "";

    if (!subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Check if user is an admin
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Rate limit (per IP) ------------------------------------------
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { data: isAllowed, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      {
        p_identifier: clientIp,
        p_action: "send_campaign_emails",
        p_max_count: 2, // 2 campaigns per hour
        p_window_seconds: 3600,
      }
    );

    if (rateLimitError) throw rateLimitError;
    if (!isAllowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Fetch recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from("campaign_recipients")
      .select("email, name")
      .eq("status", "active");

    if (recipientsError) throw recipientsError;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "No active recipients" }, { status: 400 });
    }

    // Send emails using Brevo via Promise.all
    const emailPromises = recipients.map((r: { email: string; name?: string | null }) =>
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY!,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "HKH", email: "hkh034553@gmail.com" },
          to: [{ email: r.email, name: r.name || "" }],
          subject: subject,
          htmlContent: html,
        }),
      }).then((res) => res.json())
    );

    const brevoResults = await Promise.all(emailPromises);

    return NextResponse.json({ success: true, data: brevoResults }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
