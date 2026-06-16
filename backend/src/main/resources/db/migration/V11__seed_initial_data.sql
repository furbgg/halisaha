-- Sahalar
INSERT INTO fields (name, type, hourly_price, allowed_durations, is_active, opening_time, closing_time) VALUES
    ('Platz 1', 'REGULAR', 30.00, '{1, 3}', true, '09:00', '23:00'),
    ('Platz 2', 'REGULAR', 30.00, '{1, 3}', true, '09:00', '23:00'),
    ('Platz 3', 'REGULAR', 35.00, '{1, 3}', true, '09:00', '23:00'),
    ('Platz 4', 'REGULAR', 35.00, '{1, 3}', true, '09:00', '23:00'),
    ('Bubble Arena', 'BUBBLE', 50.00, '{1, 2}', true, '10:00', '22:00');

-- Admin kullanici (change password on first login!)
INSERT INTO users (display_id, name, email, phone, password_hash, role, is_active) VALUES
    ('HS-2025-001', 'Betreiber Admin', 'admin@halisaha.at', '+43 660 9876543',
     '$2a$12$eq0WDlWi8uFKRnOVCreuDu5yp.jBHQ5wejhmVRsFmClxqtgRZKgjm', 'ADMIN', true);

-- Uygulama ayarlari
INSERT INTO app_settings (key, value, description) VALUES
    ('reminder_hours_before', '1', 'Erinnerung X Stunden vor dem Termin'),
    ('hold_duration_minutes', '5', 'Temporaere Slot-Sperre in Minuten'),
    ('max_advance_booking_days', '30', 'Maximale Vorausbuchung in Tagen'),
    ('cancellation_deadline_hours', '2', 'Stornierungsfrist in Stunden vor dem Termin'),
    ('phone_verification_required', 'false', 'SMS-Verifizierung bei Gastbuchung erforderlich');

-- Kiralanabilir malzemeler
INSERT INTO equipment (name, category, quantity, condition, is_rentable, rental_price_per_hour, available_sizes) VALUES
    ('Krampon', 'KRAMPON', 40, 'GUT', true, 3.00, '{"38","39","40","41","42","43","44","45","46"}'),
    ('Torwarthandschuhe', 'KALECI_ELDIVENI', 12, 'GUT', true, 2.00, '{"S","M","L","XL"}'),
    ('Leibchen-Set (10 Stk.)', 'YELEK', 6, 'GUT', true, 5.00, '{"Einheitsgroesse"}');

-- Envanter malzemeleri (kiralanmaz)
INSERT INTO equipment (name, category, quantity, condition, is_rentable, rental_price_per_hour) VALUES
    ('Fussball Gr. 5', 'TOP', 15, 'GUT', false, 0),
    ('Tornetz', 'DIGER', 10, 'GUT', false, 0),
    ('Trainingshuetchen-Set', 'DIGER', 4, 'GUT', false, 0);

-- Personel
INSERT INTO staff (name, role, phone, is_active) VALUES
    ('Mehmet Yilmaz', 'PLATZWART', '+43 660 1112233', true),
    ('Stefan Huber', 'KASSIERER', '+43 660 4445566', true);
