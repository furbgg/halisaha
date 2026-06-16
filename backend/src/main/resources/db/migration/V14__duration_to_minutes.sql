-- Reservations: duration_hours → duration_minutes
ALTER TABLE reservations RENAME COLUMN duration_hours TO duration_minutes;
ALTER TABLE reservations ALTER COLUMN duration_minutes SET DEFAULT 60;
UPDATE reservations SET duration_minutes = duration_minutes * 60;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_duration_hours_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_duration_minutes_check
    CHECK (duration_minutes IN (60, 90, 120, 180));

-- Slot Holds: duration_hours → duration_minutes
ALTER TABLE slot_holds RENAME COLUMN duration_hours TO duration_minutes;
ALTER TABLE slot_holds ALTER COLUMN duration_minutes SET DEFAULT 60;
UPDATE slot_holds SET duration_minutes = duration_minutes * 60;

-- Fields: allowed_durations Werte aktualisieren (Stunden → Minuten)
UPDATE fields SET allowed_durations = '{60, 90, 180}' WHERE type = 'REGULAR';
UPDATE fields SET allowed_durations = '{60, 90, 120}' WHERE type = 'BUBBLE';

-- Partial Unique Index entfernen: bei flexiblen Dauern reicht start_time allein
-- nicht aus, Ueberlappungen muessen in der Anwendung geprueft werden
DROP INDEX IF EXISTS idx_unique_active_reservation;
