CREATE TABLE fields (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('REGULAR', 'BUBBLE')),
    hourly_price DECIMAL(10, 2) NOT NULL,
    allowed_durations INTEGER[] NOT NULL DEFAULT '{1, 3}',
    is_active BOOLEAN DEFAULT true,
    opening_time TIME NOT NULL DEFAULT '09:00',
    closing_time TIME NOT NULL DEFAULT '23:00',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
