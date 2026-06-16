CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    condition VARCHAR(20) DEFAULT 'GUT'
        CHECK (condition IN ('NEU', 'GUT', 'BESCHAEDIGT', 'AUSGEMUSTERT')),
    is_rentable BOOLEAN DEFAULT false,
    rental_price_per_hour DECIMAL(10, 2) DEFAULT 0,
    available_sizes TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
