-- Idempotent demo seed for local/staging checks.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Demo users
INSERT INTO users (display_id, name, email, phone, password_hash, role, is_active, created_at, updated_at)
VALUES
  ('HS-2026-D901', 'Demo Kunde 1', 'demo1@halisaha.local', '+436601110001', crypt('DemoUser2026!', gen_salt('bf', 12)), 'USER', true, NOW(), NOW()),
  ('HS-2026-D902', 'Demo Kunde 2', 'demo2@halisaha.local', '+436601110002', crypt('DemoUser2026!', gen_salt('bf', 12)), 'USER', true, NOW(), NOW()),
  ('HS-2026-D903', 'Demo Kunde 3', 'demo3@halisaha.local', '+436601110003', crypt('DemoUser2026!', gen_salt('bf', 12)), 'USER', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = 'USER',
  is_active = true,
  updated_at = NOW();

-- Completed regular reservation (paid)
INSERT INTO reservations (
  confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price,
  status, payment_status, payment_method, privacy_accepted, privacy_accepted_at, game_type, created_at, updated_at
)
SELECT
  'DEMO-R001',
  (SELECT id FROM fields WHERE is_active = true AND 'FOOTBALL' = ANY(supported_sports) ORDER BY id LIMIT 1),
  (SELECT id FROM users WHERE lower(email) = 'demo1@halisaha.local'),
  date_trunc('hour', NOW()) - INTERVAL '7 days',
  date_trunc('hour', NOW()) - INTERVAL '7 days' + INTERVAL '60 minutes',
  60,
  78.00,
  'COMPLETED',
  'PAID',
  'CARD',
  true,
  NOW() - INTERVAL '8 days',
  'FOOTBALL',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM fields WHERE is_active = true)
ON CONFLICT (confirmation_code) DO NOTHING;

-- Upcoming regular reservation (paid)
INSERT INTO reservations (
  confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price,
  status, payment_status, payment_method, privacy_accepted, privacy_accepted_at, game_type, created_at, updated_at
)
SELECT
  'DEMO-R002',
  (SELECT id FROM fields WHERE is_active = true AND 'FOOTBALL' = ANY(supported_sports) ORDER BY id LIMIT 1),
  (SELECT id FROM users WHERE lower(email) = 'demo2@halisaha.local'),
  date_trunc('hour', NOW()) + INTERVAL '2 days',
  date_trunc('hour', NOW()) + INTERVAL '2 days' + INTERVAL '60 minutes',
  60,
  78.00,
  'CONFIRMED',
  'PAID',
  'APPLE_PAY',
  true,
  NOW(),
  'FOOTBALL',
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM fields WHERE is_active = true)
ON CONFLICT (confirmation_code) DO NOTHING;

-- Upcoming bubble reservation (paid)
INSERT INTO reservations (
  confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price,
  status, payment_status, payment_method, privacy_accepted, privacy_accepted_at, game_type, created_at, updated_at
)
SELECT
  'DEMO-B001',
  COALESCE(
    (SELECT id FROM fields WHERE is_active = true AND 'BUBBLE_SOCCER' = ANY(supported_sports) ORDER BY id LIMIT 1),
    (SELECT id FROM fields WHERE is_active = true ORDER BY id LIMIT 1)
  ),
  (SELECT id FROM users WHERE lower(email) = 'demo3@halisaha.local'),
  date_trunc('hour', NOW()) + INTERVAL '3 days',
  date_trunc('hour', NOW()) + INTERVAL '3 days' + INTERVAL '120 minutes',
  120,
  156.00,
  'CONFIRMED',
  'PAID',
  'GOOGLE_PAY',
  true,
  NOW(),
  'BUBBLE_SOCCER',
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM fields WHERE is_active = true)
ON CONFLICT (confirmation_code) DO NOTHING;

-- Cancelled reservation (refunded)
INSERT INTO reservations (
  confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price,
  status, payment_status, payment_method, privacy_accepted, privacy_accepted_at, cancelled_at, cancelled_by, game_type, created_at, updated_at
)
SELECT
  'DEMO-C001',
  (SELECT id FROM fields WHERE is_active = true AND 'FOOTBALL' = ANY(supported_sports) ORDER BY id LIMIT 1),
  (SELECT id FROM users WHERE lower(email) = 'demo1@halisaha.local'),
  date_trunc('hour', NOW()) - INTERVAL '2 days',
  date_trunc('hour', NOW()) - INTERVAL '2 days' + INTERVAL '60 minutes',
  60,
  78.00,
  'CANCELLED',
  'REFUNDED',
  'CARD',
  true,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days' + INTERVAL '10 minutes',
  'CUSTOMER',
  'FOOTBALL',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM fields WHERE is_active = true)
ON CONFLICT (confirmation_code) DO NOTHING;

-- Guest reservation (upcoming)
INSERT INTO reservations (
  confirmation_code, field_id, user_id, guest_name, guest_phone, guest_email,
  start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method,
  privacy_accepted, privacy_accepted_at, game_type, manage_token_hash, created_at, updated_at
)
SELECT
  'DEMO-G001',
  (SELECT id FROM fields WHERE is_active = true AND 'FOOTBALL' = ANY(supported_sports) ORDER BY id LIMIT 1),
  NULL,
  'Gast Demo',
  '+436601119999',
  'guest.demo@halisaha.local',
  date_trunc('hour', NOW()) + INTERVAL '1 day',
  date_trunc('hour', NOW()) + INTERVAL '1 day' + INTERVAL '60 minutes',
  60,
  78.00,
  'CONFIRMED',
  'PAID',
  'CARD',
  true,
  NOW(),
  'FOOTBALL',
  encode(digest('demo-guest-manage-token', 'sha256'), 'hex'),
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM fields WHERE is_active = true)
ON CONFLICT (confirmation_code) DO NOTHING;

-- Payments (idempotent via unique stripe_payment_intent_id)
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_demo_r001', 78.00, 'EUR', 'SUCCEEDED', 'card', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
FROM reservations WHERE confirmation_code = 'DEMO-R001'
ON CONFLICT (stripe_payment_intent_id) DO NOTHING;

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_demo_r002', 78.00, 'EUR', 'SUCCEEDED', 'apple_pay', NOW(), NOW()
FROM reservations WHERE confirmation_code = 'DEMO-R002'
ON CONFLICT (stripe_payment_intent_id) DO NOTHING;

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_demo_b001', 156.00, 'EUR', 'SUCCEEDED', 'google_pay', NOW(), NOW()
FROM reservations WHERE confirmation_code = 'DEMO-B001'
ON CONFLICT (stripe_payment_intent_id) DO NOTHING;

INSERT INTO payments (
  reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, refund_amount, refund_reason, created_at, updated_at
)
SELECT id, 'pi_demo_c001', 78.00, 'EUR', 'REFUNDED', 'card', 78.00, 'Demo cancellation', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM reservations WHERE confirmation_code = 'DEMO-C001'
ON CONFLICT (stripe_payment_intent_id) DO NOTHING;

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_demo_g001', 78.00, 'EUR', 'SUCCEEDED', 'card', NOW(), NOW()
FROM reservations WHERE confirmation_code = 'DEMO-G001'
ON CONFLICT (stripe_payment_intent_id) DO NOTHING;

-- Equipment rentals (idempotent guard with NOT EXISTS)
INSERT INTO equipment_rentals (reservation_id, equipment_id, quantity, size, rental_price, status, created_at)
SELECT
  r.id,
  (SELECT id FROM equipment WHERE is_rentable = true ORDER BY id LIMIT 1),
  2,
  '42',
  6.00,
  'RETURNED',
  NOW() - INTERVAL '7 days'
FROM reservations r
WHERE r.confirmation_code = 'DEMO-R001'
  AND NOT EXISTS (
    SELECT 1
    FROM equipment_rentals er
    WHERE er.reservation_id = r.id
      AND er.equipment_id = (SELECT id FROM equipment WHERE is_rentable = true ORDER BY id LIMIT 1)
  );
