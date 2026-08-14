# HKH Agency (Digivolve)

A bold, high-converting marketing agency website — custom web development, branding, social media marketing, and paid campaigns. Built with Next.js, deployed as a static export to GitHub Pages.

**Live site:** https://hasanshahir.github.io/Digivolve/

## Stack

- **Frontend:** Next.js 16 (static export), React 19, Tailwind CSS 4, Framer Motion, Recharts
- **Backend:** Supabase (auth, database, Edge Functions for automated emails)
- **Email:** Resend (transactional + campaign emails via Supabase Edge Functions)
- **Errors:** Sentry
- **Code review:** CodeRabbit (`.coderabbit.yaml`)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys
npm run dev                  # dev server on http://localhost:3000
npm run build                # production build → ./out
```

> Note: on some Windows setups the Turbopack dev server panics (`0xc0000142`). If that happens, `npm run build` still works — the deploy pipeline is what matters.

## Getting the site fully live — your 5-minute checklist

The site is deployed, but these integrations need **your credentials** to light up. Do them in this order:

### 1. Supabase (needed for contact form, admin login, and emails)

1. Go to https://supabase.com → create a project (free tier is fine).
2. Project Settings → **API** → copy the **Project URL** and the **anon public key**.
3. In GitHub → your repo → **Settings → Secrets and variables → Actions** → add:
   - `NEXT_PUBLIC_SUPABASE_URL` = project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
4. **Create the tables:** open the Supabase **SQL Editor**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates `contact_submissions` + `campaign_recipients` with the right security policies.
5. **Create your admin account:** in Supabase → **Authentication → Users → Add user** with email `hasanshahirconnect@gmail.com` and a strong password. That's the only account allowed into `/admin`.
6. **Deploy the email functions** (requires the Supabase CLI — `npm i -g supabase`):
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase secrets set RESEND_API_KEY=<your-resend-key> \
     EMAIL_FROM="HKH Agency <onboarding@resend.dev>" \
     CONTACT_FORM_TO=hasanshahirconnect@gmail.com
   supabase functions deploy send-lead-email
   supabase functions deploy send-campaign-emails
   ```

### 2. Resend (automated emails to clients)

1. Sign up at https://resend.com → **API Keys** → create a key.
2. Set it as `RESEND_API_KEY` above.
3. To send from your own domain instead of the default `onboarding@resend.dev`, add your domain in Resend → **Domains** → verify → then change `EMAIL_FROM` to `HKH Agency <hello@yourdomain.com>`.
4. **Test:** submit the contact form on the live site → you should get the auto-reply, and the owner notification lands in `hasanshahirconnect@gmail.com`.

### 3. Sending campaigns to your client list

1. In Supabase → **Table Editor → campaign_recipients → Insert row** for each client: `full_name`, `email` (required), optional custom `subject`/`body` (leave blank to use the default template).
2. Trigger the send — either:
   - In the Supabase dashboard: **Edge Functions → send-campaign-emails → Invoke** (POST, empty body sends to everyone with status ≠ `sent`), or
   - From the Supabase CLI:
     ```bash
     curl -X POST https://<project-ref>.supabase.co/functions/v1/send-campaign-emails \
       -H "Authorization: Bearer <anon-key>" \
       -H "Content-Type: application/json" -d '{}'
     ```
3. Re-running is safe — already-sent recipients are skipped.

### 4. Sentry (error tracking)

1. Sign up at https://sentry.io → create a **Next.js** project.
2. Copy your **DSN** (`https://...@o<org>.ingest.sentry.io/<id>`) and the **auth token** (Settings → Auth Tokens, scope: `project:releases`, `org:read`, `project:write`).
3. Add to GitHub Actions secrets:
   - `NEXT_PUBLIC_SENTRY_DSN` = DSN
   - `SENTRY_AUTH_TOKEN` = auth token
   - `SENTRY_ORG` = your Sentry org slug
   - `SENTRY_PROJECT` = your Sentry project slug (e.g. `hkh-website`)
4. Push to `main` — the deploy builds with Sentry wired in and the next broken page/error shows up in your Sentry dashboard.

### 5. CodeRabbit (AI code review)

1. Go to https://coderabbit.ai → **Add a repository** → install the GitHub App on this repo.
2. Every future pull request gets an automated AI code review. The rules live in `.coderabbit.yaml` (already configured for this codebase).

## Customizing content

- **Team:** edit the `TEAM` array in [`src/components/TeamSection.tsx`](src/components/TeamSection.tsx). Add a `image` field with a path like `"/team/hasan.jpg"` to show a real photo; otherwise a branded initials tile shows.
- **Portfolio PDF:** replace [`public/portfolio.pdf`](public/portfolio.pdf) with your real business deck (keep the same filename). The button already links everywhere it belongs (footer + homepage CTA). Regenerate the placeholder anytime with `node scripts/generate-portfolio-pdf.mjs`.
- **Colors:** brand duo (hot pink `#FD0178` + pure blue `#0000FF`) is defined in [`src/app/globals.css`](src/app/globals.css) — the createwithflow-inspired palette.
- **Contact details / WhatsApp / map:** [`src/app/contact/page.tsx`](src/app/contact/page.tsx).

## How deployment works

Every push to `main` triggers `.github/workflows/deploy.yml` → builds the static export with your Supabase/Sentry secrets → publishes to GitHub Pages. No manual steps.
