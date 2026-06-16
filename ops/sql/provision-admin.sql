CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH target AS (
  SELECT id FROM users WHERE lower(email) = lower(:'admin_email')
),
ins AS (
  INSERT INTO users (
    display_id, name, email, phone, password_hash, role, is_active, created_at, updated_at
  )
  SELECT
    'HS-' || to_char(CURRENT_DATE, 'YYYY') || '-' || upper(substr(md5(random()::text), 1, 6)),
    :'admin_name',
    lower(:'admin_email'),
    NULLIF(:'admin_phone', ''),
    crypt(:'admin_password', gen_salt('bf', 12)),
    'ADMIN',
    true,
    NOW(),
    NOW()
  WHERE NOT EXISTS (SELECT 1 FROM target)
)
UPDATE users
SET
  name = :'admin_name',
  phone = NULLIF(:'admin_phone', ''),
  role = 'ADMIN',
  is_active = true,
  password_hash = crypt(:'admin_password', gen_salt('bf', 12)),
  updated_at = NOW()
WHERE lower(email) = lower(:'admin_email');

SELECT id, display_id, email, role, is_active
FROM users
WHERE lower(email) = lower(:'admin_email');
