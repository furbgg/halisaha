ALTER TABLE reservations ADD COLUMN payment_status VARCHAR(20)
    DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'ON_SITE'));

ALTER TABLE reservations ADD COLUMN payment_method VARCHAR(20)
    CHECK (payment_method IN ('CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'ON_SITE'));

ALTER TABLE reservations ADD COLUMN stripe_payment_intent_id VARCHAR(255);

ALTER TABLE reservations ADD COLUMN paid_at TIMESTAMP;

ALTER TABLE reservations ADD COLUMN refunded_at TIMESTAMP;
