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

    // 1. Send notification to admin (hasanshahirconnect@gmail.com)
    const adminRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "HKH", email: "hkh034553@gmail.com" },
        to: [{ email: "hasanshahirconnect@gmail.com", name: "Admin" }], 
        subject: `New Contact Submission from ${name}`,
        htmlContent: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
      }),
    });

    // 2. Send auto-reply to the client
    const clientRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "HKH", email: "hkh034553@gmail.com" },
        to: [{ email: email, name: name }], 
        subject: `We've received your inquiry!`,
        htmlContent: `
          <div style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h2 style="color: #222;">Hi ${name},</h2>
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
      return NextResponse.json({ error: "Failed to send emails", adminData, clientData }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
