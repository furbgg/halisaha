CREATE TABLE equipment_rentals (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(20),
    rental_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'RESERVED'
        CHECK (status IN ('RESERVED', 'PICKED_UP', 'RETURNED', 'DAMAGED')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
