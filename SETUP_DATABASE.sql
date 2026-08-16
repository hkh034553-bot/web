-- Initial Schema

CREATE TABLE contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contact_submissions_updated_at
BEFORE UPDATE ON contact_submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_campaign_recipients_updated_at
BEFORE UPDATE ON campaign_recipients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Admin Roles and RLS

CREATE TABLE admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- admin_users policies (admins can view and insert, only owners can insert if we add owner distinction, but for now admins can manage admins)
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (is_admin());

-- contact_submissions policies
-- Anyone can insert a contact submission (rate limit will be handled in another migration)
CREATE POLICY "Anyone can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (is_admin());

-- campaign_recipients policies
CREATE POLICY "Admins can view campaign recipients"
  ON campaign_recipients FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert campaign recipients"
  ON campaign_recipients FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update campaign recipients"
  ON campaign_recipients FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete campaign recipients"
  ON campaign_recipients FOR DELETE
  USING (is_admin());
-- Rate Limiting

CREATE TABLE rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  action text not null,
  window_start timestamptz not null,
  request_count int not null default 1,
  UNIQUE(identifier, action, window_start)
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No public access to rate_limits
-- (only postgres / security definer functions can touch it)

-- Function to check and enforce rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_count int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count int;
BEGIN
  -- Determine the current time window
  v_window_start := date_trunc('second', now()) - (extract(epoch from now())::int % p_window_seconds) * interval '1 second';
  
  -- Insert or update the rate limit counter
  INSERT INTO rate_limits (identifier, action, window_start, request_count)
  VALUES (p_identifier, p_action, v_window_start, 1)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1
  RETURNING request_count INTO v_current_count;
  
  IF v_current_count > p_max_count THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Trigger to rate limit contact_submissions inserts from public
CREATE OR REPLACE FUNCTION enforce_contact_submission_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Rate limit based on email (max 3 per 1 hour)
  IF NOT check_rate_limit(NEW.email, 'contact_submission', 3, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded for this email.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER rate_limit_contact_submissions
BEFORE INSERT ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION enforce_contact_submission_rate_limit();
-- Audit Log

CREATE TABLE audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (is_admin());

-- Trigger to log destructive actions
CREATE OR REPLACE FUNCTION log_destructive_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (admin_user_id, action, target_table, target_id, metadata)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME::text, OLD.id, row_to_json(OLD));
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contact_submissions_delete
AFTER DELETE ON contact_submissions
FOR EACH ROW EXECUTE FUNCTION log_destructive_action();

CREATE TRIGGER log_campaign_recipients_delete
AFTER DELETE ON campaign_recipients
FOR EACH ROW EXECUTE FUNCTION log_destructive_action();

CREATE TRIGGER log_admin_users_delete
AFTER DELETE ON admin_users
FOR EACH ROW EXECUTE FUNCTION log_destructive_action();
-- Add RLS policy for normal users to view their own submissions

CREATE POLICY "Users can view their own contact submissions"
  ON contact_submissions FOR SELECT
  USING (email = (auth.jwt() ->> 'email'));
-- Create a public users table
CREATE TABLE users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS Policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to automatically insert users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$;

-- Note: We use auth.users which is in the auth schema
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
