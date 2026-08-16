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

    const { email, name, message } = await req.json();

    if (!email || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    // Call check_rate_limit via RPC
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

    // Send email using Brevo
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "HKH", email: "hkh034553@gmail.com" }, // Using your verified Brevo email
        to: [{ email: "hf.alihasan0@gmail.com", name: "Hasan" }], 
        subject: `New Contact Submission from ${name}`,
        htmlContent: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
      }),
    });

    const brevoData = await res.json();

    return NextResponse.json(brevoData, { status: res.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
