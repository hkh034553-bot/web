import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

// Locked down to the site origin — no wildcard CORS.
const SITE_ORIGIN = "https://hkh.agency";

const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Vary": "Origin",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // Check if user is an admin by calling the is_admin RPC or checking table
    // (RLS usually applies to data, but we can call a function directly)
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { subject, html } = await req.json();

    if (!subject || !html) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    const { data: isAllowed, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      {
        p_identifier: clientIp,
        p_action: "send_campaign_emails",
        p_max_count: 2, // e.g. 2 campaigns per hour
        p_window_seconds: 3600,
      }
    );

    if (rateLimitError) throw rateLimitError;
    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Fetch recipients using Service Role Key (bypassing RLS if necessary, though admins can read)
    // Here we use the user's client which has admin access
    const { data: recipients, error: recipientsError } = await supabase
      .from("campaign_recipients")
      .select("email, name")
      .eq("status", "active");

    if (recipientsError) throw recipientsError;

    if (!recipients || recipients.length === 0) {
      return new Response(JSON.stringify({ error: "No active recipients" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Send emails using Brevo (Looping over recipients and sending via Promise.all)
    // For large campaigns, Brevo has batch options, but Promise.all is reliable for smaller lists
    const emailPromises = recipients.map((r: any) =>
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": BREVO_API_KEY!,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Digivolve Campaigns", email: "hf.alihasan0@gmail.com" }, // Using your email as sender
          to: [{ email: r.email, name: r.name || "" }],
          subject: subject,
          htmlContent: html,
        }),
      }).then((res) => res.json())
    );

    const brevoResults = await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true, data: brevoResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: res.ok ? 200 : 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
