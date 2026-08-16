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
