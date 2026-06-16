-- Numara/beden bazlı stok takibi
CREATE TABLE equipment_size_stocks (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    size VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (equipment_id, size)
);

CREATE INDEX idx_equipment_size_stocks_equipment_id ON equipment_size_stocks(equipment_id);

-- Mevcut seed verisi: Krampon (40 toplam, 9 numara)
INSERT INTO equipment_size_stocks (equipment_id, size, quantity)
SELECT e.id, s.size, s.qty
FROM equipment e
CROSS JOIN (VALUES
    ('38', 8), ('39', 5), ('40', 5), ('41', 5), ('42', 5),
    ('43', 4), ('44', 4), ('45', 2), ('46', 2)
) AS s(size, qty)
WHERE e.name = 'Krampon';

-- Torwarthandschuhe (12 toplam, 4 beden)
INSERT INTO equipment_size_stocks (equipment_id, size, quantity)
SELECT e.id, s.size, s.qty
FROM equipment e
CROSS JOIN (VALUES
    ('S', 3), ('M', 4), ('L', 3), ('XL', 2)
) AS s(size, qty)
WHERE e.name = 'Torwarthandschuhe';

-- Leibchen-Set (6 toplam, tek beden)
INSERT INTO equipment_size_stocks (equipment_id, size, quantity)
SELECT e.id, s.size, s.qty
FROM equipment e
CROSS JOIN (VALUES
    ('Einheitsgroesse', 6)
) AS s(size, qty)
WHERE e.name = 'Leibchen-Set (10 Stk.)';
