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
