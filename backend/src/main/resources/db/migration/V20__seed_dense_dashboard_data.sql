-- ====================================================================
-- V20: Yoğun Dashboard Test Verileri — Ek veri
-- Nur 2 aktive Felder: Salamanda Feld (id=1) & Bubble Arena (id=5)
-- ====================================================================

-- Missing table for ProcessedEvent entity (Stripe webhook idempotency)
CREATE TABLE IF NOT EXISTS processed_events (
    id VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EYLÜL 2025 (6 ay gerisi — trend chart)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-SEP-01', 1, 2, '2025-09-01 17:00+02', '2025-09-01 18:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-09-01 16:00+02', '2025-09-01 16:00+02', '2025-09-01 18:00+02'),
('T-SEP-02', 1, 3, '2025-09-05 18:00+02', '2025-09-05 19:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-09-04 10:00+02', '2025-09-04 10:00+02', '2025-09-05 19:00+02'),
('T-SEP-03', 1, 4, '2025-09-10 19:00+02', '2025-09-10 20:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-09-09 12:00+02', '2025-09-09 12:00+02', '2025-09-10 20:00+02'),
('T-SEP-04', 1, 5, '2025-09-15 17:00+02', '2025-09-15 18:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2025-09-15 16:00+02', '2025-09-15 16:00+02', '2025-09-15 18:00+02'),
('T-SEP-05', 5, 6, '2025-09-20 14:00+02', '2025-09-20 16:00+02', 120, 100.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-09-19 10:00+02', '2025-09-19 10:00+02', '2025-09-20 16:00+02'),
('T-SEP-06', 1, 7, '2025-09-22 20:00+02', '2025-09-22 21:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-09-21 15:00+02', '2025-09-21 15:00+02', '2025-09-22 21:00+02'),
('T-SEP-07', 1, 2, '2025-09-25 10:00+02', '2025-09-25 11:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-09-24 18:00+02', '2025-09-24 18:00+02', '2025-09-25 11:00+02'),
('T-SEP-08', 5, 3, '2025-09-28 15:00+02', '2025-09-28 17:00+02', 120, 100.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-09-27 11:00+02', '2025-09-27 11:00+02', '2025-09-28 17:00+02');

-- ============================================
-- EKİM 2025
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-OKT-01', 1, 4, '2025-10-02 17:00+02', '2025-10-02 18:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-10-01 18:00+02', '2025-10-01 18:00+02', '2025-10-02 18:00+02'),
('T-OKT-02', 1, 5, '2025-10-06 18:00+02', '2025-10-06 19:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-10-05 12:00+02', '2025-10-05 12:00+02', '2025-10-06 19:00+02'),
('T-OKT-03', 1, 6, '2025-10-10 19:00+02', '2025-10-10 20:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-10-09 15:00+02', '2025-10-09 15:00+02', '2025-10-10 20:00+02'),
('T-OKT-04', 5, 7, '2025-10-14 14:00+02', '2025-10-14 16:00+02', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-10-13 10:00+02', '2025-10-13 10:00+02', '2025-10-14 16:00+02'),
('T-OKT-05', 1, 2, '2025-10-18 11:00+02', '2025-10-18 12:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-10-17 09:00+02', '2025-10-17 09:00+02', '2025-10-18 12:00+02'),
('T-OKT-06', 1, 3, '2025-10-20 15:00+02', '2025-10-20 16:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2025-10-20 14:00+02', '2025-10-20 14:00+02', '2025-10-20 16:00+02'),
('T-OKT-07', 1, 4, '2025-10-23 17:00+02', '2025-10-23 18:00+02', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-10-22 20:00+02', '2025-10-22 20:00+02', '2025-10-23 18:00+02'),
('T-OKT-08', 5, 5, '2025-10-27 10:00+01', '2025-10-27 12:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-10-26 15:00+01', '2025-10-26 15:00+01', '2025-10-27 12:00+01');

-- ============================================
-- KASIM 2025
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-NOV-01', 1, 2, '2025-11-03 17:00+01', '2025-11-03 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-11-02 12:00+01', '2025-11-02 12:00+01', '2025-11-03 18:00+01'),
('T-NOV-02', 1, 3, '2025-11-06 18:00+01', '2025-11-06 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-11-05 10:00+01', '2025-11-05 10:00+01', '2025-11-06 19:00+01'),
('T-NOV-03', 1, 4, '2025-11-10 19:00+01', '2025-11-10 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-11-09 15:00+01', '2025-11-09 15:00+01', '2025-11-10 20:00+01'),
('T-NOV-04', 5, 5, '2025-11-13 14:00+01', '2025-11-13 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2025-11-13 12:00+01', '2025-11-13 12:00+01', '2025-11-13 16:00+01'),
('T-NOV-05', 1, 6, '2025-11-15 15:00+01', '2025-11-15 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-11-14 09:00+01', '2025-11-14 09:00+01', '2025-11-15 16:00+01'),
('T-NOV-06', 1, 7, '2025-11-18 10:00+01', '2025-11-18 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-11-17 20:00+01', '2025-11-17 20:00+01', '2025-11-18 11:00+01'),
('T-NOV-07', 1, 2, '2025-11-20 15:00+01', '2025-11-20 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-11-19 11:00+01', '2025-11-19 11:00+01', '2025-11-20 16:00+01'),
('T-NOV-08', 5, 3, '2025-11-24 14:00+01', '2025-11-24 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-11-23 14:00+01', '2025-11-23 14:00+01', '2025-11-24 16:00+01');

-- ============================================
-- BUGÜN: 28 Şubat 2026 — Salamanda + Bubble
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-TOD-01', 1, 2, '2026-02-28 09:00+01', '2026-02-28 10:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 01:30+01', '2026-02-28 01:30+01', '2026-02-28 01:30+01'),
('T-TOD-02', 1, 3, '2026-02-28 12:00+01', '2026-02-28 13:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-28 01:31+01', '2026-02-28 01:31+01', '2026-02-28 01:31+01'),
('T-TOD-03', 1, 6, '2026-02-28 15:00+01', '2026-02-28 16:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 01:32+01', '2026-02-28 01:32+01', '2026-02-28 01:32+01'),
('T-TOD-04', 1, 4, '2026-02-28 18:00+01', '2026-02-28 19:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 01:33+01', '2026-02-28 01:33+01', '2026-02-28 01:33+01'),
('T-TOD-05', 1, 5, '2026-02-28 20:00+01', '2026-02-28 21:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'ON_SITE', true, '2026-02-28 01:34+01', '2026-02-28 01:34+01', '2026-02-28 01:34+01'),
('T-TOD-06', 5, 7, '2026-02-28 11:00+01', '2026-02-28 13:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 01:35+01', '2026-02-28 01:35+01', '2026-02-28 01:35+01'),
('T-TOD-07', 1, null, '2026-02-28 22:00+01', '2026-02-28 23:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 02:00+01', '2026-02-28 02:00+01', '2026-02-28 02:00+01');
UPDATE reservations SET guest_name='Thomas Berger', guest_phone='+43 660 7771234', guest_email='thomas.berger@gmx.at' WHERE confirmation_code='T-TOD-07';

-- ============================================
-- DÜN: 27 Şubat 2026
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-YST-01', 1, 7, '2026-02-27 10:00+01', '2026-02-27 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-26 18:00+01', '2026-02-26 18:00+01', '2026-02-27 11:00+01'),
('T-YST-02', 1, 2, '2026-02-27 17:00+01', '2026-02-27 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-26 20:00+01', '2026-02-26 20:00+01', '2026-02-27 18:00+01'),
('T-YST-03', 1, 3, '2026-02-27 14:00+01', '2026-02-27 15:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-26 12:00+01', '2026-02-26 12:00+01', '2026-02-27 15:00+01'),
('T-YST-04', 5, 4, '2026-02-27 14:00+01', '2026-02-27 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-02-27 12:00+01', '2026-02-27 12:00+01', '2026-02-27 16:00+01'),
('T-YST-05', 1, 5, '2026-02-27 18:00+01', '2026-02-27 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-26 10:00+01', '2026-02-26 10:00+01', '2026-02-27 19:00+01'),
('T-YST-06', 1, 6, '2026-02-27 20:00+01', '2026-02-27 21:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-26 15:00+01', '2026-02-26 15:00+01', '2026-02-27 21:00+01');

-- ============================================
-- BU HAFTA: Pazartesi-Perşembe (23-26 Şub)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-W23-01', 1, 3, '2026-02-23 17:00+01', '2026-02-23 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-22 18:00+01', '2026-02-22 18:00+01', '2026-02-23 18:00+01'),
('T-W23-02', 1, 4, '2026-02-23 19:00+01', '2026-02-23 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-22 20:00+01', '2026-02-22 20:00+01', '2026-02-23 20:00+01'),
('T-W23-03', 5, 5, '2026-02-23 14:00+01', '2026-02-23 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-22 15:00+01', '2026-02-22 15:00+01', '2026-02-23 16:00+01'),
('T-W24-01', 1, 6, '2026-02-24 10:00+01', '2026-02-24 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-23 18:00+01', '2026-02-23 18:00+01', '2026-02-24 11:00+01'),
('T-W24-02', 1, 7, '2026-02-24 18:00+01', '2026-02-24 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-02-24 17:00+01', '2026-02-24 17:00+01', '2026-02-24 19:00+01'),
('T-W25-01', 1, 3, '2026-02-25 15:00+01', '2026-02-25 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-24 10:00+01', '2026-02-24 10:00+01', '2026-02-25 16:00+01'),
('T-W25-02', 5, 4, '2026-02-25 14:00+01', '2026-02-25 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-24 09:00+01', '2026-02-24 09:00+01', '2026-02-25 16:00+01'),
('T-W26-01', 1, 6, '2026-02-26 17:00+01', '2026-02-26 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-25 18:00+01', '2026-02-25 18:00+01', '2026-02-26 18:00+01'),
('T-W26-02', 1, 7, '2026-02-26 19:00+01', '2026-02-26 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-25 20:00+01', '2026-02-25 20:00+01', '2026-02-26 20:00+01');

-- ============================================
-- ŞUBAT BAŞI (1-22) — ek
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-FEB-A01', 1, 3, '2026-02-02 17:00+01', '2026-02-02 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-01 18:00+01', '2026-02-01 18:00+01', '2026-02-02 18:00+01'),
('T-FEB-A02', 1, 4, '2026-02-03 18:00+01', '2026-02-03 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-02 20:00+01', '2026-02-02 20:00+01', '2026-02-03 19:00+01'),
('T-FEB-A03', 1, 5, '2026-02-04 19:00+01', '2026-02-04 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-03 10:00+01', '2026-02-03 10:00+01', '2026-02-04 20:00+01'),
('T-FEB-A04', 1, 6, '2026-02-05 17:00+01', '2026-02-05 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-04 12:00+01', '2026-02-04 12:00+01', '2026-02-05 18:00+01'),
('T-FEB-A05', 5, 7, '2026-02-07 14:00+01', '2026-02-07 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-06 09:00+01', '2026-02-06 09:00+01', '2026-02-07 16:00+01'),
('T-FEB-A06', 1, 2, '2026-02-09 10:00+01', '2026-02-09 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-02-09 09:00+01', '2026-02-09 09:00+01', '2026-02-09 11:00+01'),
('T-FEB-A07', 1, 3, '2026-02-10 18:00+01', '2026-02-10 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-09 15:00+01', '2026-02-09 15:00+01', '2026-02-10 19:00+01'),
('T-FEB-A08', 1, 4, '2026-02-11 20:00+01', '2026-02-11 21:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-10 18:00+01', '2026-02-10 18:00+01', '2026-02-11 21:00+01'),
('T-FEB-A09', 5, 5, '2026-02-12 14:00+01', '2026-02-12 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-11 10:00+01', '2026-02-11 10:00+01', '2026-02-12 16:00+01'),
('T-FEB-A10', 1, 6, '2026-02-14 17:00+01', '2026-02-14 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-13 20:00+01', '2026-02-13 20:00+01', '2026-02-14 18:00+01'),
('T-FEB-A11', 1, 7, '2026-02-16 19:00+01', '2026-02-16 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-15 10:00+01', '2026-02-15 10:00+01', '2026-02-16 20:00+01');

-- ============================================
-- MART 2026 (gelecek ay)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('T-MAR-01', 1, 2, '2026-03-02 17:00+01', '2026-03-02 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 01:50+01', '2026-02-28 01:50+01', '2026-02-28 01:50+01'),
('T-MAR-02', 1, 3, '2026-03-04 18:00+01', '2026-03-04 19:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 01:51+01', '2026-02-28 01:51+01', '2026-02-28 01:51+01'),
('T-MAR-03', 5, 4, '2026-03-06 14:00+01', '2026-03-06 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-28 01:52+01', '2026-02-28 01:52+01', '2026-02-28 01:52+01'),
('T-MAR-04', 1, 5, '2026-03-09 17:00+01', '2026-03-09 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 01:53+01', '2026-02-28 01:53+01', '2026-02-28 01:53+01');

-- ============================================
-- İPTALLER (Erstattet)
-- ============================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, cancelled_at, cancelled_by, created_at, updated_at) VALUES
('T-CAN-01', 1, 5, '2026-02-06 17:00+01', '2026-02-06 18:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'CARD', true, '2026-02-05 10:00+01', 'CUSTOMER', '2026-02-04 18:00+01', '2026-02-05 10:00+01'),
('T-CAN-02', 1, 6, '2026-02-13 18:00+01', '2026-02-13 19:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'APPLE_PAY', true, '2026-02-12 15:00+01', 'ADMIN', '2026-02-11 20:00+01', '2026-02-12 15:00+01');

-- ============================================
-- ÖDEMELER
-- ============================================
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v20_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'T-TOD-%' AND status <> 'CANCELLED';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v20_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'T-YST-%';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at, updated_at)
SELECT id, 'pi_v20_' || confirmation_code, total_price, 'EUR', 'SUCCEEDED',
  CASE payment_method WHEN 'APPLE_PAY' THEN 'apple_pay' WHEN 'GOOGLE_PAY' THEN 'google_pay' WHEN 'CARD' THEN 'card' ELSE 'card' END,
  created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'T-W%';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, refund_amount, refund_reason, created_at, updated_at)
SELECT id, 'pi_v20_' || confirmation_code, total_price, 'EUR', 'REFUNDED', 'card', total_price, 'Kundenstornierung', created_at, updated_at
FROM reservations WHERE confirmation_code LIKE 'T-CAN-%';

INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, failure_reason, created_at, updated_at) VALUES
((SELECT id FROM reservations WHERE confirmation_code='T-TOD-01'), 'pi_v20_fail_01', 30.00, 'EUR', 'FAILED', 'card', 'insufficient_funds', '2026-02-28 01:25+01', '2026-02-28 01:25+01'),
((SELECT id FROM reservations WHERE confirmation_code='T-FEB-A01'), 'pi_v20_fail_02', 30.00, 'EUR', 'FAILED', 'card', 'expired_card', '2026-02-01 17:00+01', '2026-02-01 17:00+01');

-- ============================================
-- MALZEME KİRALAMALARI
-- ============================================
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 1, '42', 2, 6.00, CASE WHEN status='COMPLETED' THEN 'RETURNED' ELSE 'RESERVED' END
FROM reservations WHERE confirmation_code IN ('T-TOD-01','T-TOD-04','T-YST-01','T-YST-03','T-W23-01','T-W24-01','T-W25-01','T-W26-01','T-FEB-A01','T-FEB-A06','T-FEB-A10');

INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 1, '43', 1, 3.00, CASE WHEN status='COMPLETED' THEN 'RETURNED' ELSE 'RESERVED' END
FROM reservations WHERE confirmation_code IN ('T-TOD-02','T-YST-02','T-YST-05','T-W23-02','T-W26-02','T-FEB-A02','T-FEB-A07','T-FEB-A11');

INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 2, 'L', 1, 2.00, CASE WHEN status='COMPLETED' THEN 'RETURNED' ELSE 'RESERVED' END
FROM reservations WHERE confirmation_code IN ('T-TOD-01','T-YST-01','T-YST-05','T-W23-01','T-W25-01','T-FEB-A01','T-FEB-A10');

INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status)
SELECT id, 3, 'Einheitsgroesse', 1, 5.00, CASE WHEN status='COMPLETED' THEN 'RETURNED' ELSE 'RESERVED' END
FROM reservations WHERE confirmation_code IN ('T-TOD-06','T-YST-04','T-W23-03','T-W25-02','T-FEB-A05','T-FEB-A09');
