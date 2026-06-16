-- ====================================================================
-- V21: Mart 2026 Dashboard Verileri
-- Bugün (1 Mart 2026) ve bu ay boyunca dolu veri
-- Nur 2 aktive Felder: Salamanda Feld (id=1, €30) & Bubble Arena (id=5, €50/100)
-- ====================================================================

-- ============================================
-- BUGÜN: 1 Mart 2026 — Salamanda Feld (id=1)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('M-TOD-01', 1, 2, '2026-03-01 09:00+01', '2026-03-01 10:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 20:00+01', '2026-02-28 20:00+01', '2026-02-28 20:00+01'),
('M-TOD-02', 1, 3, '2026-03-01 10:00+01', '2026-03-01 11:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 21:00+01', '2026-02-28 21:00+01', '2026-02-28 21:00+01'),
('M-TOD-03', 1, 4, '2026-03-01 12:00+01', '2026-03-01 13:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-28 22:00+01', '2026-02-28 22:00+01', '2026-02-28 22:00+01'),
('M-TOD-04', 1, 5, '2026-03-01 14:00+01', '2026-03-01 15:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 08:00+01', '2026-03-01 08:00+01', '2026-03-01 08:00+01'),
('M-TOD-05', 1, 6, '2026-03-01 17:00+01', '2026-03-01 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 09:00+01', '2026-03-01 09:00+01', '2026-03-01 09:00+01'),
('M-TOD-06', 1, 7, '2026-03-01 18:00+01', '2026-03-01 19:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'ON_SITE', true, '2026-03-01 10:00+01', '2026-03-01 10:00+01', '2026-03-01 10:00+01'),
('M-TOD-07', 1, 2, '2026-03-01 19:00+01', '2026-03-01 20:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 11:00+01', '2026-03-01 11:00+01', '2026-03-01 11:00+01'),
('M-TOD-08', 1, 3, '2026-03-01 20:00+01', '2026-03-01 21:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-03-01 12:00+01', '2026-03-01 12:00+01', '2026-03-01 12:00+01'),
('M-TOD-09', 1, 4, '2026-03-01 21:00+01', '2026-03-01 22:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 13:00+01', '2026-03-01 13:00+01', '2026-03-01 13:00+01');

-- ============================================
-- BUGÜN: 1 Mart 2026 — Bubble Arena (id=5)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('M-TOD-10', 5, 5, '2026-03-01 10:00+01', '2026-03-01 12:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 23:00+01', '2026-02-28 23:00+01', '2026-02-28 23:00+01'),
('M-TOD-11', 5, 6, '2026-03-01 14:00+01', '2026-03-01 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 08:30+01', '2026-03-01 08:30+01', '2026-03-01 08:30+01'),
('M-TOD-12', 5, 7, '2026-03-01 17:00+01', '2026-03-01 19:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-03-01 09:30+01', '2026-03-01 09:30+01', '2026-03-01 09:30+01');

-- Misafir (Guest) bugün Salamanda Feld
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('M-TOD-13', 1, null, '2026-03-01 15:00+01', '2026-03-01 16:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 14:00+01', '2026-03-01 14:00+01', '2026-03-01 14:00+01');
UPDATE reservations SET guest_name='Markus Gruber', guest_phone='+43 664 1234567', guest_email='markus.gruber@gmx.at' WHERE confirmation_code='M-TOD-13';

-- Storniert bugün
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, cancelled_at, cancelled_by, created_at, updated_at) VALUES
('M-TOD-CAN', 1, 7, '2026-03-01 11:00+01', '2026-03-01 12:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'CARD', true, '2026-03-01 07:00+01', 'CUSTOMER', '2026-02-28 18:00+01', '2026-03-01 07:00+01');

-- ============================================
-- DÜN: 28 Şubat 2026 — ek (V19/V20'ye ek olmasın, farklı kodlarla)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('M-YST-01', 1, 2, '2026-02-28 09:00+01', '2026-02-28 10:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-27 20:00+01', '2026-02-27 20:00+01', '2026-02-28 10:00+01'),
('M-YST-02', 1, 5, '2026-02-28 15:00+01', '2026-02-28 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-27 22:00+01', '2026-02-27 22:00+01', '2026-02-28 16:00+01'),
('M-YST-03', 5, 6, '2026-02-28 14:00+01', '2026-02-28 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-27 18:00+01', '2026-02-27 18:00+01', '2026-02-28 16:00+01');

-- ============================================
-- BU HAFTA: 2-6 Mart 2026 (Pazartesi-Cuma)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('M-W02-01', 1, 3, '2026-03-02 17:00+01', '2026-03-02 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 14:00+01', '2026-03-01 14:00+01', '2026-03-01 14:00+01'),
('M-W02-02', 1, 4, '2026-03-02 19:00+01', '2026-03-02 20:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 15:00+01', '2026-03-01 15:00+01', '2026-03-01 15:00+01'),
('M-W02-03', 5, 5, '2026-03-02 14:00+01', '2026-03-02 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-03-01 16:00+01', '2026-03-01 16:00+01', '2026-03-01 16:00+01'),
('M-W03-01', 1, 6, '2026-03-03 10:00+01', '2026-03-03 11:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 17:00+01', '2026-03-01 17:00+01', '2026-03-01 17:00+01'),
('M-W03-02', 1, 7, '2026-03-03 18:00+01', '2026-03-03 19:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'ON_SITE', true, '2026-03-01 18:00+01', '2026-03-01 18:00+01', '2026-03-01 18:00+01'),
('M-W04-01', 1, 2, '2026-03-04 15:00+01', '2026-03-04 16:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-03-01 19:00+01', '2026-03-01 19:00+01', '2026-03-01 19:00+01'),
('M-W04-02', 5, 3, '2026-03-04 14:00+01', '2026-03-04 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 19:10+01', '2026-03-01 19:10+01', '2026-03-01 19:10+01'),
('M-W05-01', 1, 4, '2026-03-05 17:00+01', '2026-03-05 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 19:20+01', '2026-03-01 19:20+01', '2026-03-01 19:20+01'),
('M-W05-02', 1, 5, '2026-03-05 19:00+01', '2026-03-05 20:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 19:30+01', '2026-03-01 19:30+01', '2026-03-01 19:30+01'),
('M-W06-01', 1, 6, '2026-03-06 18:00+01', '2026-03-06 19:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 19:35+01', '2026-03-01 19:35+01', '2026-03-01 19:35+01'),
('M-W06-02', 5, 7, '2026-03-06 14:00+01', '2026-03-06 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-03-01 19:40+01', '2026-03-01 19:40+01', '2026-03-01 19:40+01');

-- ============================================
-- MART (8-31) — Ek haftalık veriler
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('M-MID-01', 1, 2, '2026-03-09 17:00+01', '2026-03-09 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 19:42+01', '2026-03-01 19:42+01', '2026-03-01 19:42+01'),
('M-MID-02', 5, 3, '2026-03-10 14:00+01', '2026-03-10 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 19:43+01', '2026-03-01 19:43+01', '2026-03-01 19:43+01'),
('M-MID-03', 1, 4, '2026-03-12 18:00+01', '2026-03-12 19:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-03-01 19:44+01', '2026-03-01 19:44+01', '2026-03-01 19:44+01'),
('M-MID-04', 1, 5, '2026-03-15 10:00+01', '2026-03-15 11:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-03-01 19:45+01', '2026-03-01 19:45+01', '2026-03-01 19:45+01'),
('M-MID-05', 5, 6, '2026-03-18 14:00+01', '2026-03-18 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'ON_SITE', true, '2026-03-01 19:46+01', '2026-03-01 19:46+01', '2026-03-01 19:46+01'),
('M-MID-06', 1, 7, '2026-03-20 19:00+01', '2026-03-20 20:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-03-01 19:47+01', '2026-03-01 19:47+01', '2026-03-01 19:47+01');

-- ============================================
-- ÖDEMELER — Bugünkü ve haftalık
-- ============================================
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v21_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'M-TOD-%' AND status <> 'CANCELLED';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v21_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'M-YST-%';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v21_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'M-W%';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v21_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'M-MID-%';

-- Storniert reservation → refunded payment
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, refund_amount, refund_reason, created_at, updated_at)
SELECT id, 'pi_v21_' || confirmation_code, total_price, 'EUR', 'REFUNDED', 'card', total_price, 'Kundenstornierung', created_at, updated_at
FROM reservations WHERE confirmation_code = 'M-TOD-CAN';

-- Failed payment
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, failure_reason, created_at, updated_at) VALUES
((SELECT id FROM reservations WHERE confirmation_code='M-TOD-01'), 'pi_v21_fail_01', 30.00, 'EUR', 'FAILED', 'card', 'insufficient_funds', '2026-02-28 19:50+01', '2026-02-28 19:50+01');

-- ============================================
-- MALZEME KİRALAMALARI — Krampon, Leibchen, Torwarthandschuhe
-- ============================================
-- Krampon (equipment_id=1) Gr. 42 — bugün
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 1, '42', 2, 6.00, 'RESERVED'
FROM reservations WHERE confirmation_code IN ('M-TOD-01','M-TOD-04','M-TOD-07','M-TOD-10');

-- Krampon Gr. 43
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 1, '43', 1, 3.00, 'RESERVED'
FROM reservations WHERE confirmation_code IN ('M-TOD-02','M-TOD-05','M-TOD-08');

-- Leibchen-Set (equipment_id=2)
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 2, 'L', 1, 2.00, 'RESERVED'
FROM reservations WHERE confirmation_code IN ('M-TOD-01','M-TOD-06','M-TOD-11');

-- Torwarthandschuhe (equipment_id=3)
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 3, 'Einheitsgroesse', 1, 5.00, 'RESERVED'
FROM reservations WHERE confirmation_code IN ('M-TOD-10','M-TOD-12');

-- Krampon für Wochentage
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 1, '42', 2, 6.00, 'RESERVED'
FROM reservations WHERE confirmation_code IN ('M-W02-01','M-W03-01','M-W04-01','M-W05-01','M-W06-01');

-- Leibchen für Wochentage
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 2, 'L', 1, 2.00, 'RESERVED'
FROM reservations WHERE confirmation_code IN ('M-W02-03','M-W04-02','M-W06-02');
