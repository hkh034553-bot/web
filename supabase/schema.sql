-- ============================================================
-- HKH Agency — Supabase schema
-- Run this once in the Supabase SQL Editor (https://supabase.com/dashboard
-- → your project → SQL Editor → paste → Run).
-- ============================================================

-- ---------- contact_submissions (contact form leads) ----------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  project_focus text,
  budget_range text,
  message text
);

alter table public.contact_submissions enable row level security;

-- Anyone can submit a lead (public contact form)
create policy "anyone can insert contact submissions"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Only the owner admin can read leads
create policy "admin can read contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (auth.email() = 'hasanshahirconnect@gmail.com');

-- Only the owner admin can delete leads
create policy "admin can delete contact submissions"
  on public.contact_submissions
  for delete
  to authenticated
  using (auth.email() = 'hasanshahirconnect@gmail.com');

-- ---------- campaign_recipients (automated email campaigns) ----------
create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text,
  email text not null unique,
  subject text,
  body text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamptz
);

alter table public.campaign_recipients enable row level security;

-- Recipients list is private; the Edge Function uses the service role key
-- which bypasses RLS. Nobody reads or writes this table from the browser.
create policy "no public access to campaign recipients"
  on public.campaign_recipients
  for all
  to anon
  using (false);

-- ---------- Storage bucket for the portfolio PDF (optional) ----------
-- If you'd rather serve the PDF from Supabase Storage than the repo:
-- insert into storage.buckets (id, name, public)
-- values ('portfolio', 'portfolio', true);
-- Then upload public/portfolio-hkh.pdf there and link:
--   https://<project-ref>.supabase.co/storage/v1/object/public/portfolio/portfolio-hkh.pdf
