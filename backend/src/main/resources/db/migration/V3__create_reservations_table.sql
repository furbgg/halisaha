CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    confirmation_code VARCHAR(20) UNIQUE NOT NULL,
    field_id BIGINT NOT NULL REFERENCES fields(id),
    user_id BIGINT REFERENCES users(id),
    guest_name VARCHAR(100),
    guest_phone VARCHAR(20),
    guest_email VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours IN (1, 2, 3)),
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
        CHECK (status IN ('CONFIRMED', 'CANCELLED', 'MODIFIED', 'COMPLETED', 'NO_SHOW')),
    privacy_accepted BOOLEAN NOT NULL DEFAULT false,
    privacy_accepted_at TIMESTAMP,
    notification_consent BOOLEAN DEFAULT false,
    notification_consent_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cift rezervasyon onleme: ayni saha + ayni saat + aktif rezervasyon tekrarlanamaz
CREATE UNIQUE INDEX idx_unique_active_reservation
    ON reservations (field_id, start_time)
    WHERE status NOT IN ('CANCELLED');
