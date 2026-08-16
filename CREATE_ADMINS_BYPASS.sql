-- Enable pgcrypto extension if not already enabled (required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert the 3 rate-limited accounts directly into the auth system
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
) VALUES 
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', '0alihasanfarooqui0@gmail.com', crypt('7531ae658c9cacc5', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'hasanshahirconnect@gmail.com', crypt('e7d4ff60761143fb', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'hkh034553@gmail.com', crypt('39f73d466ba6e492', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false)
ON CONFLICT (email) DO NOTHING;

-- Grant ALL 4 of the accounts Admin status
INSERT INTO public.admin_users (id)
SELECT id FROM auth.users 
WHERE email IN (
  'hf.alihasan0@gmail.com',
  '0alihasanfarooqui0@gmail.com',
  'hasanshahirconnect@gmail.com',
  'hkh034553@gmail.com'
)
ON CONFLICT (id) DO NOTHING;
