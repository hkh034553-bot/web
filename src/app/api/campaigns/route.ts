import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Check if user is an admin
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, html } = await req.json();

    if (!subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

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
    const emailPromises = recipients.map((r: any) =>
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
