-- ====================================================================
-- V19: Dashboard Test-Daten (Dezember 2025 – März 2026)
-- Nur 2 aktive Felder: Salamanda Feld (id=1) & Bubble Arena (id=5)
-- Satışa çıkmadan önce bu migration silinir.
-- ====================================================================

-- Kayıtlı müşteriler (Test)
INSERT INTO users (display_id, name, email, phone, password_hash, role, is_active) VALUES
    ('HS-2025-010', 'Ali Karagöz', 'ali.karagoz@gmail.com', '+43 660 1234567',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'USER', true),
    ('HS-2025-011', 'Emre Demir', 'emre.demir@hotmail.com', '+43 699 7654321',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'USER', true),
    ('HS-2025-012', 'Stefan Gruber', 'stefan.gruber@gmx.at', '+43 664 3334455',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'USER', true),
    ('HS-2025-013', 'Mehmet Yıldız', 'mehmet.yildiz@outlook.at', '+43 676 8889900',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'USER', true),
    ('HS-2025-014', 'Markus Bauer', 'markus.bauer@a1.net', '+43 650 5556677',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'USER', true),
    ('HS-2025-015', 'Hasan Özkan', 'hasan.ozkan@icloud.com', '+43 660 9998877',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'USER', true);

-- ====================================================================
-- DEZEMBER 2025 (geçmiş ay 1) — Salamanda=30€, Bubble=50€
-- ====================================================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('RES-DEC-001', 1, 2, '2025-12-02 10:00+01', '2025-12-02 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-12-01 18:00+01', '2025-12-01 18:00+01', '2025-12-02 11:00+01'),
('RES-DEC-002', 1, 3, '2025-12-02 14:00+01', '2025-12-02 15:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-12-01 20:00+01', '2025-12-01 20:00+01', '2025-12-02 15:00+01'),
('RES-DEC-003', 1, 4, '2025-12-05 18:00+01', '2025-12-05 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-12-04 10:00+01', '2025-12-04 10:00+01', '2025-12-05 19:00+01'),
('RES-DEC-004', 1, 5, '2025-12-08 17:00+01', '2025-12-08 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-12-07 09:00+01', '2025-12-07 09:00+01', '2025-12-08 18:00+01'),
('RES-DEC-005', 1, 6, '2025-12-12 20:00+01', '2025-12-12 21:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'CARD', true, '2025-12-11 10:00+01', '2025-12-11 10:00+01', '2025-12-12 12:00+01'),
('RES-DEC-006', 1, 7, '2025-12-15 09:00+01', '2025-12-15 10:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-12-14 14:00+01', '2025-12-14 14:00+01', '2025-12-15 10:00+01'),
('RES-DEC-007', 1, 2, '2025-12-19 15:00+01', '2025-12-19 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2025-12-18 11:00+01', '2025-12-18 11:00+01', '2025-12-19 16:00+01'),
('RES-DEC-008', 1, 3, '2025-12-03 11:00+01', '2025-12-03 12:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-12-03 10:30+01', '2025-12-03 10:30+01', '2025-12-03 12:00+01'),
('RES-DEC-009', 1, 4, '2025-12-06 19:00+01', '2025-12-06 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-12-05 16:00+01', '2025-12-05 16:00+01', '2025-12-06 20:00+01'),
('RES-DEC-010', 1, 5, '2025-12-10 16:00+01', '2025-12-10 17:00+01', 60, 30.00, 'NO_SHOW', 'PAID', 'GOOGLE_PAY', true, '2025-12-09 12:00+01', '2025-12-09 12:00+01', '2025-12-10 17:00+01'),
('RES-DEC-011', 5, 6, '2025-12-06 14:00+01', '2025-12-06 15:00+01', 60, 50.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2025-12-05 10:00+01', '2025-12-05 10:00+01', '2025-12-06 15:00+01'),
('RES-DEC-012', 5, 5, '2025-12-13 16:00+01', '2025-12-13 18:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2025-12-12 08:00+01', '2025-12-12 08:00+01', '2025-12-13 18:00+01'),
('RES-DEC-013', 5, 7, '2025-12-21 11:00+01', '2025-12-21 13:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2025-12-20 16:00+01', '2025-12-20 16:00+01', '2025-12-21 13:00+01');

-- ====================================================================
-- JÄNNER 2026 (geçmiş ay 2)
-- ====================================================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('RES-JAN-001', 1, 2, '2026-01-05 10:00+01', '2026-01-05 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-01-04 18:00+01', '2026-01-04 18:00+01', '2026-01-05 11:00+01'),
('RES-JAN-002', 1, 3, '2026-01-05 14:00+01', '2026-01-05 15:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-01-04 20:00+01', '2026-01-04 20:00+01', '2026-01-05 15:00+01'),
('RES-JAN-003', 1, 4, '2026-01-08 18:00+01', '2026-01-08 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-01-07 09:00+01', '2026-01-07 09:00+01', '2026-01-08 19:00+01'),
('RES-JAN-004', 1, 5, '2026-01-12 17:00+01', '2026-01-12 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-01-11 12:00+01', '2026-01-11 12:00+01', '2026-01-12 18:00+01'),
('RES-JAN-005', 1, 6, '2026-01-15 20:00+01', '2026-01-15 21:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-01-14 16:00+01', '2026-01-14 16:00+01', '2026-01-15 21:00+01'),
('RES-JAN-006', 1, 7, '2026-01-19 09:00+01', '2026-01-19 10:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'GOOGLE_PAY', true, '2026-01-18 10:00+01', '2026-01-18 10:00+01', '2026-01-19 08:00+01'),
('RES-JAN-007', 1, 2, '2026-01-22 15:00+01', '2026-01-22 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-01-21 11:00+01', '2026-01-21 11:00+01', '2026-01-22 16:00+01'),
('RES-JAN-008', 1, 4, '2026-01-26 19:00+01', '2026-01-26 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-01-26 18:30+01', '2026-01-26 18:30+01', '2026-01-26 20:00+01'),
('RES-JAN-009', 5, 3, '2026-01-10 14:00+01', '2026-01-10 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-01-09 10:00+01', '2026-01-09 10:00+01', '2026-01-10 16:00+01'),
('RES-JAN-010', 5, 7, '2026-01-17 11:00+01', '2026-01-17 13:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-01-16 08:00+01', '2026-01-16 08:00+01', '2026-01-17 13:00+01'),
('RES-JAN-011', 5, 4, '2026-01-25 16:00+01', '2026-01-25 18:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-01-24 12:00+01', '2026-01-24 12:00+01', '2026-01-25 18:00+01');

-- ====================================================================
-- FEBRUAR 2026 (bu ay)
-- ====================================================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
-- Bu hafta (23-28 Şub)
('RES-FEB-001', 1, 2, '2026-02-23 10:00+01', '2026-02-23 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-22 18:00+01', '2026-02-22 18:00+01', '2026-02-23 11:00+01'),
('RES-FEB-002', 1, 3, '2026-02-23 15:00+01', '2026-02-23 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-22 20:00+01', '2026-02-22 20:00+01', '2026-02-23 16:00+01'),
('RES-FEB-003', 1, 4, '2026-02-24 18:00+01', '2026-02-24 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-23 10:00+01', '2026-02-23 10:00+01', '2026-02-24 19:00+01'),
('RES-FEB-004', 1, 5, '2026-02-25 17:00+01', '2026-02-25 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-24 12:00+01', '2026-02-24 12:00+01', '2026-02-25 18:00+01'),
('RES-FEB-005', 1, 6, '2026-02-25 19:00+01', '2026-02-25 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-02-24 15:00+01', '2026-02-24 15:00+01', '2026-02-25 20:00+01'),
('RES-FEB-006', 1, 7, '2026-02-26 20:00+01', '2026-02-26 21:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-25 18:00+01', '2026-02-25 18:00+01', '2026-02-26 21:00+01'),
('RES-FEB-007', 1, 2, '2026-02-26 15:00+01', '2026-02-26 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-25 20:00+01', '2026-02-25 20:00+01', '2026-02-26 16:00+01'),
('RES-FEB-008', 1, 4, '2026-02-27 10:00+01', '2026-02-27 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-27 09:30+01', '2026-02-27 09:30+01', '2026-02-27 11:00+01'),
('RES-FEB-009', 1, 5, '2026-02-27 14:00+01', '2026-02-27 15:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'CARD', true, '2026-02-26 12:00+01', '2026-02-26 12:00+01', '2026-02-27 08:00+01'),
-- Bugün (28 Şub)
('RES-FEB-010', 1, 2, '2026-02-28 10:00+01', '2026-02-28 11:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-27 20:00+01', '2026-02-27 20:00+01', '2026-02-28 00:00+01'),
('RES-FEB-011', 1, 3, '2026-02-28 14:00+01', '2026-02-28 15:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-27 22:00+01', '2026-02-27 22:00+01', '2026-02-28 00:00+01'),
('RES-FEB-012', 1, 6, '2026-02-28 19:00+01', '2026-02-28 20:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 01:00+01', '2026-02-28 01:00+01', '2026-02-28 01:00+01'),
('RES-FEB-013', 1, 4, '2026-02-28 11:00+01', '2026-02-28 12:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'ON_SITE', true, '2026-02-27 19:00+01', '2026-02-27 19:00+01', '2026-02-28 00:00+01'),
('RES-FEB-014', 1, 5, '2026-02-28 17:00+01', '2026-02-28 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 00:30+01', '2026-02-28 00:30+01', '2026-02-28 00:30+01'),
('RES-FEB-015', 5, 7, '2026-02-28 10:00+01', '2026-02-28 12:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-27 21:00+01', '2026-02-27 21:00+01', '2026-02-28 00:00+01'),
('RES-FEB-016', 5, 3, '2026-02-28 14:00+01', '2026-02-28 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 00:45+01', '2026-02-28 00:45+01', '2026-02-28 00:45+01'),
('RES-FEB-017', 1, 7, '2026-02-28 21:00+01', '2026-02-28 22:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-27 23:00+01', '2026-02-27 23:00+01', '2026-02-28 00:00+01'),
-- Daha önceki Şubat
('RES-FEB-018', 1, 7, '2026-02-02 10:00+01', '2026-02-02 11:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-01 18:00+01', '2026-02-01 18:00+01', '2026-02-02 11:00+01'),
('RES-FEB-019', 1, 2, '2026-02-03 14:00+01', '2026-02-03 15:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-02 20:00+01', '2026-02-02 20:00+01', '2026-02-03 15:00+01'),
('RES-FEB-020', 1, 3, '2026-02-05 18:00+01', '2026-02-05 19:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-04 10:00+01', '2026-02-04 10:00+01', '2026-02-05 19:00+01'),
('RES-FEB-021', 5, 4, '2026-02-07 14:00+01', '2026-02-07 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-06 09:00+01', '2026-02-06 09:00+01', '2026-02-07 16:00+01'),
('RES-FEB-022', 1, 5, '2026-02-09 20:00+01', '2026-02-09 21:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-08 16:00+01', '2026-02-08 16:00+01', '2026-02-09 21:00+01'),
('RES-FEB-023', 1, 6, '2026-02-10 13:00+01', '2026-02-10 14:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-02-09 08:00+01', '2026-02-09 08:00+01', '2026-02-10 14:00+01'),
('RES-FEB-024', 1, 7, '2026-02-12 21:00+01', '2026-02-12 22:00+01', 60, 30.00, 'CANCELLED', 'REFUNDED', 'CARD', true, '2026-02-11 19:00+01', '2026-02-11 19:00+01', '2026-02-12 15:00+01'),
('RES-FEB-025', 1, 2, '2026-02-14 15:00+01', '2026-02-14 16:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'GOOGLE_PAY', true, '2026-02-13 20:00+01', '2026-02-13 20:00+01', '2026-02-14 16:00+01'),
('RES-FEB-026', 5, 3, '2026-02-15 14:00+01', '2026-02-15 16:00+01', 120, 100.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-14 10:00+01', '2026-02-14 10:00+01', '2026-02-15 16:00+01'),
('RES-FEB-027', 1, 4, '2026-02-16 09:00+01', '2026-02-16 10:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'CARD', true, '2026-02-15 14:00+01', '2026-02-15 14:00+01', '2026-02-16 10:00+01'),
('RES-FEB-028', 1, 5, '2026-02-18 19:00+01', '2026-02-18 20:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'APPLE_PAY', true, '2026-02-17 15:00+01', '2026-02-17 15:00+01', '2026-02-18 20:00+01'),
('RES-FEB-029', 1, 6, '2026-02-19 17:00+01', '2026-02-19 18:00+01', 60, 30.00, 'COMPLETED', 'PAID', 'ON_SITE', true, '2026-02-18 10:00+01', '2026-02-18 10:00+01', '2026-02-19 18:00+01');

-- ====================================================================
-- MÄRZ 2026 (gelecek ay)
-- ====================================================================
INSERT INTO reservations (confirmation_code, field_id, user_id, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('RES-MAR-001', 1, 2, '2026-03-02 10:00+01', '2026-03-02 11:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-27 20:00+01', '2026-02-27 20:00+01', '2026-02-27 20:00+01'),
('RES-MAR-002', 1, 3, '2026-03-04 14:00+01', '2026-03-04 15:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 01:00+01', '2026-02-28 01:00+01', '2026-02-28 01:00+01'),
('RES-MAR-003', 5, 4, '2026-03-06 14:00+01', '2026-03-06 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-27 10:00+01', '2026-02-27 10:00+01', '2026-02-27 10:00+01'),
('RES-MAR-004', 1, 5, '2026-03-07 17:00+01', '2026-03-07 18:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-28 00:00+01', '2026-02-28 00:00+01', '2026-02-28 00:00+01'),
('RES-MAR-005', 1, 6, '2026-03-09 19:00+01', '2026-03-09 20:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-27 15:00+01', '2026-02-27 15:00+01', '2026-02-27 15:00+01'),
('RES-MAR-006', 5, 7, '2026-03-14 14:00+01', '2026-03-14 16:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'APPLE_PAY', true, '2026-02-27 18:00+01', '2026-02-27 18:00+01', '2026-02-27 18:00+01');

-- Misafir Rezervasyonları (bugün)
INSERT INTO reservations (confirmation_code, field_id, guest_name, guest_phone, guest_email, start_time, end_time, duration_minutes, total_price, status, payment_status, payment_method, privacy_accepted, paid_at, created_at, updated_at) VALUES
('RES-GST-001', 1, 'Thomas Müller', '+43 660 1111111', 'thomas.m@gmail.com', '2026-02-28 16:00+01', '2026-02-28 17:00+01', 60, 30.00, 'CONFIRMED', 'PAID', 'CARD', true, '2026-02-28 01:20+01', '2026-02-28 01:20+01', '2026-02-28 01:20+01'),
('RES-GST-002', 5, 'Serkan Aydın', '+43 699 2222222', 'serkan.a@hotmail.com', '2026-02-28 18:00+01', '2026-02-28 20:00+01', 120, 100.00, 'CONFIRMED', 'PAID', 'GOOGLE_PAY', true, '2026-02-28 01:40+01', '2026-02-28 01:40+01', '2026-02-28 01:40+01');

-- ====================================================================
-- ÖDEMELER
-- ====================================================================
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, card_brand, card_last4, created_at, updated_at) VALUES
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-010'), 'pi_test_feb010', 30.00, 'EUR', 'SUCCEEDED', 'apple_pay', null, null, '2026-02-27 20:00+01', '2026-02-27 20:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-011'), 'pi_test_feb011', 30.00, 'EUR', 'SUCCEEDED', 'google_pay', null, null, '2026-02-27 22:00+01', '2026-02-27 22:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-012'), 'pi_test_feb012', 30.00, 'EUR', 'SUCCEEDED', 'card', 'visa', '4242', '2026-02-28 01:00+01', '2026-02-28 01:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-015'), 'pi_test_feb015', 100.00, 'EUR', 'SUCCEEDED', 'card', null, null, '2026-02-27 21:00+01', '2026-02-27 21:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-016'), 'pi_test_feb016', 100.00, 'EUR', 'SUCCEEDED', 'apple_pay', null, null, '2026-02-28 00:45+01', '2026-02-28 00:45+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-GST-001'), 'pi_test_gst001', 30.00, 'EUR', 'SUCCEEDED', 'card', 'mastercard', '8888', '2026-02-28 01:20+01', '2026-02-28 01:20+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-GST-002'), 'pi_test_gst002', 100.00, 'EUR', 'SUCCEEDED', 'google_pay', null, null, '2026-02-28 01:40+01', '2026-02-28 01:40+01'),
-- İadeler
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-009'), 'pi_test_feb009', 30.00, 'EUR', 'REFUNDED', 'card', 'visa', '1234', '2026-02-26 12:00+01', '2026-02-27 08:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-024'), 'pi_test_feb024', 30.00, 'EUR', 'REFUNDED', 'card', 'mastercard', '5678', '2026-02-11 19:00+01', '2026-02-12 15:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-DEC-005'), 'pi_test_dec005', 30.00, 'EUR', 'REFUNDED', 'card', 'visa', '9012', '2025-12-11 10:00+01', '2025-12-12 12:00+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-JAN-006'), 'pi_test_jan006', 30.00, 'EUR', 'REFUNDED', 'google_pay', null, null, '2026-01-18 10:00+01', '2026-01-19 08:00+01');

UPDATE payments SET refund_amount = amount, refund_reason = 'Kundenstornierung' WHERE status = 'REFUNDED';

-- Başarısız ödemeler
INSERT INTO payments (reservation_id, stripe_payment_intent_id, amount, currency, status, payment_method, failure_reason, created_at, updated_at) VALUES
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-010'), 'pi_test_fail_001', 30.00, 'EUR', 'FAILED', 'card', 'insufficient_funds', '2026-02-27 19:50+01', '2026-02-27 19:50+01'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-013'), 'pi_test_fail_002', 30.00, 'EUR', 'FAILED', 'card', 'card_declined', '2026-02-27 18:45+01', '2026-02-27 18:45+01');

-- ====================================================================
-- MALZEME KİRALAMALARI
-- ====================================================================
INSERT INTO equipment_rentals (reservation_id, equipment_id, size, quantity, rental_price, status) VALUES
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-010'), 1, '42', 2, 6.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-011'), 1, '43', 1, 3.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-013'), 1, '41', 2, 6.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-016'), 1, '44', 3, 18.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-GST-001'), 1, '42', 1, 3.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-JAN-001'), 1, '43', 2, 6.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-JAN-005'), 1, '42', 1, 3.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-DEC-001'), 1, '42', 2, 6.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-DEC-003'), 1, '43', 1, 3.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-001'), 1, '42', 2, 6.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-003'), 1, '41', 1, 3.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-018'), 1, '44', 2, 6.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-022'), 1, '42', 1, 3.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-027'), 1, '43', 2, 6.00, 'RETURNED'),
-- Torwarthandschuhe
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-010'), 2, 'L', 1, 2.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-016'), 2, 'M', 2, 8.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-JAN-003'), 2, 'L', 1, 2.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-JAN-009'), 2, 'XL', 2, 8.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-DEC-011'), 2, 'M', 1, 2.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-005'), 2, 'L', 1, 2.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-020'), 2, 'M', 2, 4.00, 'RETURNED'),
-- Leibchen-Set
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-016'), 3, 'Einheitsgroesse', 1, 10.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-GST-001'), 3, 'Einheitsgroesse', 1, 5.00, 'RESERVED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-JAN-009'), 3, 'Einheitsgroesse', 1, 10.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-DEC-012'), 3, 'Einheitsgroesse', 2, 20.00, 'RETURNED'),
((SELECT id FROM reservations WHERE confirmation_code='RES-FEB-026'), 3, 'Einheitsgroesse', 1, 10.00, 'RETURNED');
