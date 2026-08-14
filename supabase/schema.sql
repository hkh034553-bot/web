-- ============================================================
-- HKH Agency — Supabase schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard
-- → your project → SQL Editor → paste → Run).
--
-- The file is re-runnable: tables/policies/constraints are created
-- idempotently, so you can paste the latest version over an old one.
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

-- Data-quality constraints (added idempotently so re-runs are safe)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contact_submissions_email_format') then
    alter table public.contact_submissions
      add constraint contact_submissions_email_format
      check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'contact_submissions_lengths') then
    alter table public.contact_submissions
      add constraint contact_submissions_lengths
      check (
        char_length(full_name) between 1 and 100
        and char_length(coalesce(project_focus, '')) <= 100
        and char_length(coalesce(budget_range, '')) <= 100
        and char_length(coalesce(message, '')) <= 2000
      );
  end if;
end $$;

-- Anyone can submit a lead (public contact form)
create policy "anyone can insert contact submissions"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Only the owner admin can read leads
drop policy if exists "admin can read contact submissions" on public.contact_submissions;
create policy "admin can read contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (auth.email() = 'hasanshahirconnect@gmail.com');

-- Only the owner admin can delete leads
drop policy if exists "admin can delete contact submissions" on public.contact_submissions;
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

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'campaign_recipients_email_format') then
    alter table public.campaign_recipients
      add constraint campaign_recipients_email_format
      check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'campaign_recipients_lengths') then
    alter table public.campaign_recipients
      add constraint campaign_recipients_lengths
      check (
        char_length(coalesce(full_name, '')) <= 100
        and char_length(coalesce(subject, '')) <= 200
        and char_length(coalesce(body, '')) <= 5000
      );
  end if;
end $$;

-- Recipients list is private; the Edge Function uses the service role key
-- which bypasses RLS. Browsers get NO anonymous access.
drop policy if exists "no public access to campaign recipients" on public.campaign_recipients;
create policy "no public access to campaign recipients"
  on public.campaign_recipients
  for all
  to anon
  using (false);

-- The owner admin can manage recipients from the admin dashboard:
-- list them, add new ones, and (optionally) delete them.
drop policy if exists "admin can select campaign recipients" on public.campaign_recipients;
create policy "admin can select campaign recipients"
  on public.campaign_recipients
  for select
  to authenticated
  using (auth.email() = 'hasanshahirconnect@gmail.com');

drop policy if exists "admin can insert campaign recipients" on public.campaign_recipients;
create policy "admin can insert campaign recipients"
  on public.campaign_recipients
  for insert
  to authenticated
  with check (auth.email() = 'hasanshahirconnect@gmail.com');

drop policy if exists "admin can delete campaign recipients" on public.campaign_recipients;
create policy "admin can delete campaign recipients"
  on public.campaign_recipients
  for delete
  to authenticated
  using (auth.email() = 'hasanshahirconnect@gmail.com');

-- ---------- Storage bucket for the portfolio PDF (optional) ----------
-- If you'd rather serve the PDF from Supabase Storage than the repo:
-- insert into storage.buckets (id, name, public)
-- values ('portfolio', 'portfolio', true);
-- Then upload public/portfolio-hkh.pdf there and link:
--   https://<project-ref>.supabase.co/storage/v1/object/public/portfolio/portfolio-hkh.pdf
