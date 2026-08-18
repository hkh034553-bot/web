-- ==================================================================
-- Security hardening + feature support
--  1. UTM tracking columns on contact_submissions
--  2. Sanitize-before-storing trigger
--  3. Security event logging RPC
--  4. Least-privilege grants (restrict database permissions)
-- ==================================================================

-- ------------------------------------------------------------------
-- 1. UTM tracking columns
-- ------------------------------------------------------------------
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS gclid text;

-- ------------------------------------------------------------------
-- 2. Sanitize before storing
--    Strips markup/control chars, trims, caps lengths, and validates
--    the email format before any row is persisted — covers both the
--    client-side insert and any other anon/authenticated path.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sanitize_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.name := NULLIF(btrim(regexp_replace(COALESCE(NEW.name, ''), '<[^>]*>', '', 'g')), '');
  NEW.name := left(NEW.name, 120);
  NEW.email := NULLIF(btrim(lower(regexp_replace(COALESCE(NEW.email, ''), '<[^>]*>', '', 'g'))), '');
  NEW.email := left(NEW.email, 254);
  NEW.message := NULLIF(btrim(regexp_replace(COALESCE(NEW.message, ''), '<[^>]*>', '', 'g')), '');
  NEW.message := left(NEW.message, 5000);
  NEW.message := regexp_replace(NEW.message, '[\u0000-\u0008\u000B\u000C\u000E-\u001F]', '', 'g');

  NEW.utm_source   := left(regexp_replace(COALESCE(NEW.utm_source, ''),   '<[^>]*>', '', 'g'), 200);
  NEW.utm_medium   := left(regexp_replace(COALESCE(NEW.utm_medium, ''),   '<[^>]*>', '', 'g'), 200);
  NEW.utm_campaign := left(regexp_replace(COALESCE(NEW.utm_campaign, ''), '<[^>]*>', '', 'g'), 200);
  NEW.utm_term     := left(regexp_replace(COALESCE(NEW.utm_term, ''),     '<[^>]*>', '', 'g'), 200);
  NEW.utm_content  := left(regexp_replace(COALESCE(NEW.utm_content, ''),  '<[^>]*>', '', 'g'), 200);
  NEW.gclid        := left(regexp_replace(COALESCE(NEW.gclid, ''),        '<[^>]*>', '', 'g'), 200);

  IF NEW.name IS NULL OR NEW.email IS NULL OR NEW.message IS NULL THEN
    RAISE EXCEPTION 'Please fill in all required fields.';
  END IF;

  IF NEW.email !~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Please provide a valid email address.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_contact_submissions ON contact_submissions;
CREATE TRIGGER sanitize_contact_submissions
BEFORE INSERT ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION sanitize_contact_submission();

-- ------------------------------------------------------------------
-- 3. Security event logging
--    Callable by authenticated users (admin or not); inserts into
--    audit_log with the current user id. Anon cannot call it.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_security_event(p_action text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_log (admin_user_id, action, target_table, metadata)
  VALUES (auth.uid(), left(p_action, 200), 'security', COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

GRANT EXECUTE ON FUNCTION log_security_event(text, jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION log_security_event(text, jsonb) FROM anon;

-- ------------------------------------------------------------------
-- 4. Restrict database permissions (least privilege)
-- ------------------------------------------------------------------
-- contact_submissions: anyone can INSERT (rate-limited + sanitized by
-- triggers); authenticated users can read their own rows / admins all
-- rows via RLS policies.
REVOKE ALL ON contact_submissions FROM anon, authenticated;
GRANT INSERT ON contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON contact_submissions TO authenticated;

-- campaign_recipients: admin-only via RLS policies.
REVOKE ALL ON campaign_recipients FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON campaign_recipients TO authenticated;

-- admin_users: admin-only via RLS policies.
REVOKE ALL ON admin_users FROM anon;
GRANT SELECT, INSERT ON admin_users TO authenticated;

-- rate_limits: only reachable through SECURITY DEFINER functions.
REVOKE ALL ON rate_limits FROM anon, authenticated;

-- users: self-service only (RLS restricts to own row).
REVOKE ALL ON users FROM anon;
GRANT SELECT, UPDATE ON users TO authenticated;

-- audit_log: read via RLS (admins); writes only via SECURITY DEFINER
-- functions (log_destructive_action, log_security_event).
REVOKE ALL ON audit_log FROM anon;
GRANT SELECT ON audit_log TO authenticated;

-- is_admin() is referenced by RLS policies, so authenticated users must
-- keep EXECUTE — but anonymous callers should not be able to probe it.
REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
