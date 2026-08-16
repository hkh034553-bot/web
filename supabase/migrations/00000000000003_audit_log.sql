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
