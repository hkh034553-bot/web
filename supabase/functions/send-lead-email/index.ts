/**
 * send-lead-email — automated emails for contact-form leads.
 *
 * Triggered by the public contact form after a successful DB insert. Sends:
 *   1. A confirmation email to the lead's inbox ("we got your inquiry").
 *   2. A notification email to the owner inbox.
 *
 * Env secrets (set with `supabase secrets set`):
 *   RESEND_API_KEY            — Resend API key (https://resend.com/api-keys)
 *   CONTACT_FORM_TO           — owner inbox (default: hasanshahirconnect@gmail.com)
 *   EMAIL_FROM                — sender address verified in Resend (default: HKH Agency <onboarding@resend.dev>)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
const ownerInbox = Deno.env.get("CONTACT_FORM_TO") ?? "hasanshahirconnect@gmail.com";
const emailFrom =
  Deno.env.get("EMAIL_FROM") ?? "HKH Agency <onboarding@resend.dev>";

interface LeadPayload {
  fullName?: string;
  email?: string;
  projectFocus?: string;
  budgetRange?: string;
  message?: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: emailFrom, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return res.json();
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  if (!resendKey) {
    return new Response("Email is not configured (missing RESEND_API_KEY)", {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as LeadPayload;
    const leadEmail = body.email?.trim().toLowerCase() ?? "";
    const fullName = body.fullName?.trim() || "there";

    if (!leadEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) {
      return new Response("A valid email is required", { status: 400, headers: corsHeaders });
    }

    const focus = body.projectFocus || "Consultation";
    const budget = body.budgetRange || "Not specified";
    const message = body.message || "No message provided.";

    // 1) Confirmation to the lead
    await sendEmail(
      leadEmail,
      "We received your inquiry — HKH Agency",
      `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAF6;border:2px solid #16151A;border-radius:14px;padding:32px;">
        <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">HKH<span style="color:#FD0178;">.</span></div>
        <h2 style="margin:20px 0 8px;color:#16151A;">Thanks, ${fullName} — we got it.</h2>
        <p style="color:#5B5A63;line-height:1.6;">
          Your inquiry about <strong>${focus}</strong> has been received. A senior team member
          will reply within 24 hours (usually much faster).
        </p>
        <p style="color:#5B5A63;line-height:1.6;">— HKH Agency · Zero templates. Direct execution.</p>
      </div>
      `
    );

    // 2) Notification to the owner
    await sendEmail(
      ownerInbox,
      `New lead: ${fullName} (${focus})`,
      `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAF6;border:2px solid #16151A;border-radius:14px;padding:32px;">
        <h2 style="margin:0 0 16px;color:#16151A;">New growth inquiry 🚀</h2>
        <table style="width:100%;border-collapse:collapse;color:#16151A;font-size:14px;">
          <tr><td style="padding:6px 0;color:#5B5A63;">Name</td><td style="padding:6px 0;font-weight:700;">${fullName}</td></tr>
          <tr><td style="padding:6px 0;color:#5B5A63;">Email</td><td style="padding:6px 0;font-weight:700;">${leadEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#5B5A63;">Project focus</td><td style="padding:6px 0;font-weight:700;">${focus}</td></tr>
          <tr><td style="padding:6px 0;color:#5B5A63;">Budget</td><td style="padding:6px 0;font-weight:700;">${budget}</td></tr>
        </table>
        <div style="margin-top:16px;padding:12px;background:#FFFFFF;border:1px solid #E5E5E0;border-radius:8px;color:#16151A;font-size:14px;line-height:1.6;">${message}</div>
      </div>
      `
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-lead-email failed:", err);
    return new Response(JSON.stringify({ ok: false, error: "Failed to send emails" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
