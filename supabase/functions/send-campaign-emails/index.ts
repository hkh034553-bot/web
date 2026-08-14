/**
 * send-campaign-emails — automated email campaigns to your client list.
 *
 * Reads recipients from the `campaign_recipients` table, sends each one a
 * personalized email, and records delivery status back into the same table.
 * Safe to re-run: skips recipients whose status is already "sent".
 *
 * Env secrets (set with `supabase secrets set`):
 *   RESEND_API_KEY            — Resend API key (https://resend.com/api-keys)
 *   EMAIL_FROM                — sender address verified in Resend (default: HKH Agency <onboarding@resend.dev>)
 *   SUPABASE_URL              — your project URL (auto-injected when deployed to Supabase)
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (used server-side only; never exposed to the browser)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
const emailFrom =
  Deno.env.get("EMAIL_FROM") ?? "HKH Agency <onboarding@resend.dev>";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface Recipient {
  id: string;
  full_name: string;
  email: string;
  subject?: string;
  body?: string;
  status?: string;
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

async function supabaseFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
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
  if (!resendKey || !supabaseUrl || !serviceRoleKey) {
    return new Response(
      "Email is not configured (missing RESEND_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    // Optional body: pass { recipient_ids: [...] } to target specific recipients,
    // otherwise every pending recipient in the table is emailed.
    const body = await req.json().catch(() => ({}));
    const targetIds: string[] | undefined = body?.recipient_ids;

    let recipients: Recipient[];
    if (targetIds && targetIds.length > 0) {
      recipients = await supabaseFetch(
        `campaign_recipients?select=*&id=in.(${targetIds.join(",")})&status=neq.sent`
      );
    } else {
      recipients = await supabaseFetch(
        "campaign_recipients?select=*&status=neq.sent&limit=500"
      );
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, skipped: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      if (!r.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) {
        continue;
      }
      const subject =
        r.subject || "A quick opportunity for your brand — HKH Agency";
      const bodyHtml =
        r.body ||
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAF6;border:2px solid #16151A;border-radius:14px;padding:32px;">
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">HKH<span style="color:#FD0178;">.</span></div>
          <h2 style="margin:20px 0 8px;color:#16151A;">Hi ${r.full_name || "there"},</h2>
          <p style="color:#5B5A63;line-height:1.6;">We help brands like yours grow with high-impact web design, branding, and paid campaigns. Reply to this email and we'll send over our portfolio — zero pressure, just the proof.</p>
          <p style="color:#5B5A63;line-height:1.6;">— HKH Agency · Zero templates. Direct execution.</p>
        </div>
        `;

      try {
        await sendEmail(r.email, subject, bodyHtml);
        sent++;
        // Mark as sent (idempotent — won't be re-sent on retries)
        await supabaseFetch(`campaign_recipients?id=eq.${r.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
        });
      } catch (err) {
        failed++;
        console.error(`Campaign email failed for ${r.email}:`, err);
        await supabaseFetch(`campaign_recipients?id=eq.${r.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "failed" }),
        }).catch(() => {});
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, failed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-campaign-emails failed:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to send campaign emails" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
