-- Add separate weekday (Mo-Do) and weekend (Fr-So) schedules
-- If closing < opening, it means the closing time is on the next day (midnight crossing)
-- Nullable: when NULL, falls back to opening_time/closing_time

ALTER TABLE fields ADD COLUMN weekday_opening TIME;
ALTER TABLE fields ADD COLUMN weekday_closing TIME;
ALTER TABLE fields ADD COLUMN weekend_opening TIME;
ALTER TABLE fields ADD COLUMN weekend_closing TIME;

-- Set Salamanda Soccer Arena real hours for all existing fields
UPDATE fields SET
    weekday_opening = '16:30',
    weekday_closing = '00:00',
    weekend_opening = '12:00',
    weekend_closing = '01:30',
    opening_time = '12:00',
    closing_time = '01:30';
