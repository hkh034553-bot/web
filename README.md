# HKH Agency (Digivolve)

A bold, high-converting marketing agency website — custom web development, branding, social media marketing, and paid campaigns. Built with Next.js and deployed to Vercel.

**Live site:** [Vercel Deployment URL]

## Stack

- **Frontend:** Next.js 16 (static export), React 19, Tailwind CSS 4, Framer Motion, Recharts

## Local development

```bash
npm install
npm run dev                  # dev server on http://localhost:3000
npm run build                # production build
```

## Customizing content

- **Team:** edit the `TEAM` array in `src/components/TeamSection.tsx` (currently the two leads: Hafeez Farooq, CEO and Founder; Hasan Shahir, Lead Team Developer). Add an `image` field with a path like `"/team/hasan.jpg"` to show a real photo; otherwise a branded initials tile shows.
- **Search/FAQ content:** `src/lib/site.ts` holds the search index and FAQ items used by the site search (Ctrl/Cmd+K) and the contact page.
- **Security:** security headers (HSTS, etc.) live in `next.config.ts`; the hardening SQL migration is `supabase/migrations/00000000000006_security_hardening.sql`; API routes enforce same-origin, body-size limits, and sanitization.
- **Portfolio PDF:** replace `public/portfolio.pdf` with your real business deck (keep the same filename). The button already links everywhere it belongs (footer + homepage CTA).
- **Colors:** brand duo (hot pink `#FD0178` + pure blue `#0000FF`) is defined in `src/app/globals.css`.
- **Contact details / WhatsApp / map:** `src/app/contact/page.tsx`.

## How deployment works

Every push to `main` on GitHub will automatically trigger a deployment to Vercel.
