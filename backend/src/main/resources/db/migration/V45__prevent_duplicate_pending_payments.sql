-- Prevent more than one active (PENDING) payment row per reservation.
-- This guards against duplicate payment intent creation under retries/races.
CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_reservation_pending
    ON payments (reservation_id)
    WHERE status = 'PENDING';
