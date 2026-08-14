/**
 * send-campaign-emails — automated email campaigns to your client list.
 *
 * Reads recipients from the `campaign_recipients` table, sends each one a
 * personalized email, and records delivery status back into the same table.
 * Safe to re-run: skips recipients whose status is already "sent".
 *
 * SECURITY: This function is ADMIN-ONLY. The caller must present a valid
 * Supabase session JWT for hasanshahirconnect@gmail.com (the owner). Anyone
 * else gets 401 — this prevents strangers from burning your Resend quota by
 * blasting your recipient list.
 *
 * Env secrets (set with `supabase secrets set`):
 *   RESEND_API_KEY            — Resend API key (https://resend.com/api-keys)
 *   EMAIL_FROM                — sender address verified in Resend (default: HKH Agency <onboarding@resend.dev>)
 *   SUPABASE_URL              — your project URL (auto-injected when deployed to Supabase)
 *   SUPABASE_ANON_KEY         — anon key (auto-injected when deployed to Supabase; used only to verify JWTs)
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (used server-side only; never exposed to the browser)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
const emailFrom =
  Deno.env.get("EMAIL_FROM") ?? "HKH Agency <onboarding@resend.dev>";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OWNER_EMAIL = "hasanshahirconnect@gmail.com";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Recipient {
  id: string;
  full_name: string;
  email: string;
  subject?: string;
  body?: string;
  status?: string;
}

// Simple HTML escaping — safe for plain-text user input in email templates.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

// Verify the caller is the owner (admin). Returns true + the user on success.
async function isAdmin(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token || !supabaseUrl || !anonKey) return false;

  try {
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    return !error && data.user?.email === OWNER_EMAIL;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Admin-only gate — the whole point of this function is sending mail.
  if (!(await isAdmin(req))) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
      // Only accept UUIDs — prevents malformed PostgREST filter injection.
      const validIds = targetIds.filter((id) => UUID_RE.test(String(id)));
      if (validIds.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: "Invalid recipient_ids" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      recipients = await supabaseFetch(
        `campaign_recipients?select=*&id=in.(${validIds.join(",")})&status=neq.sent`
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
      const toEmail = String(r.email ?? "").trim().toLowerCase();
      if (!EMAIL_RE.test(toEmail)) {
        continue;
      }
      const subject =
        r.subject || "A quick opportunity for your brand — HKH Agency";
      const eName = escapeHtml(String(r.full_name ?? "there")).slice(0, 100);
      const bodyHtml =
        r.body ||
        `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAF6;border:2px solid #16151A;border-radius:14px;padding:32px;">
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">HKH<span style="color:#FD0178;">.</span></div>
          <h2 style="margin:20px 0 8px;color:#16151A;">Hi ${eName},</h2>
          <p style="color:#5B5A63;line-height:1.6;">We help brands like yours grow with high-impact web design, branding, and paid campaigns. Reply to this email and we'll send over our portfolio — zero pressure, just the proof.</p>
          <p style="color:#5B5A63;line-height:1.6;">— HKH Agency · Zero templates. Direct execution.</p>
        </div>
        `;

      try {
        await sendEmail(toEmail, subject, bodyHtml);
        sent++;
        // Mark as sent (idempotent — won't be re-sent on retries)
        await supabaseFetch(`campaign_recipients?id=eq.${r.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
        });
      } catch (err) {
        failed++;
        console.error(`Campaign email failed for ${toEmail}:`, err);
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
