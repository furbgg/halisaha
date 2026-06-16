-- V15: Reduce 5 fields to 2 (1 Football + 1 Bubble)
-- Rename REGULAR → FOOTBALL to match frontend expectations

-- 1. Deactivate Platz 2, 3, 4 (keep only Platz 1 and Bubble Arena)
UPDATE fields SET is_active = false WHERE id IN (2, 3, 4);

-- 2. Rename Platz 1 → Salamanda Feld
UPDATE fields SET name = 'Salamanda Feld' WHERE id = 1;

-- 3. Update CHECK constraint to use FOOTBALL instead of REGULAR first to allow the update
ALTER TABLE fields DROP CONSTRAINT IF EXISTS fields_type_check;
ALTER TABLE fields ADD CONSTRAINT fields_type_check CHECK (type IN ('FOOTBALL', 'BUBBLE', 'REGULAR'));

-- 4. Update type REGULAR → FOOTBALL
UPDATE fields SET type = 'FOOTBALL' WHERE type = 'REGULAR';

-- 4b. Restrict constraint to only FOOTBALL and BUBBLE now that REGULAR is gone
ALTER TABLE fields DROP CONSTRAINT IF EXISTS fields_type_check;
ALTER TABLE fields ADD CONSTRAINT fields_type_check CHECK (type IN ('FOOTBALL', 'BUBBLE'));

-- 5. Both fields get all 5 durations: 60/90/120/150/180
UPDATE fields SET allowed_durations = ARRAY[60, 90, 120, 150, 180] WHERE type = 'FOOTBALL';
UPDATE fields SET allowed_durations = ARRAY[60, 90, 120, 150, 180] WHERE type = 'BUBBLE';

-- 6. Update reservations duration constraint to allow 150 minutes
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_duration_minutes_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_duration_minutes_check
    CHECK (duration_minutes IN (60, 90, 120, 150, 180));
