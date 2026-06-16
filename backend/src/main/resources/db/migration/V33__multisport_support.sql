-- V31__multisport_support.sql
-- Add supported_sports array to fields
ALTER TABLE fields ADD COLUMN supported_sports text[];

-- Migrate existing 'type' logic to the new array
UPDATE fields 
SET supported_sports = ARRAY[type]::text[] 
WHERE type IS NOT NULL;

-- If it was bubble, maybe it supports both? Let's just default to [FOOTBALL, BUBBLE_SOCCER] for existing fields since the user said both fields support both currently.
UPDATE fields 
SET supported_sports = ARRAY['FOOTBALL', 'BUBBLE_SOCCER']::text[];

ALTER TABLE fields ALTER COLUMN supported_sports SET NOT NULL;
ALTER TABLE fields DROP COLUMN type;

-- Add game_type to reservations
ALTER TABLE reservations ADD COLUMN game_type VARCHAR(50);

-- Default existing reservations to FOOTBALL (as fallback)
UPDATE reservations SET game_type = 'FOOTBALL' WHERE game_type IS NULL;

ALTER TABLE reservations ALTER COLUMN game_type SET NOT NULL;
