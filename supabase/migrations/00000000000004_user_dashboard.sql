-- Add RLS policy for normal users to view their own submissions

CREATE POLICY "Users can view their own contact submissions"
  ON contact_submissions FOR SELECT
  USING (email = (auth.jwt() ->> 'email'));
