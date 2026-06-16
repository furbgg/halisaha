-- Drop the obsolete 'type' column that causes DataIntegrityViolationException on field creation
-- We now use supported_sports integer array for multiple sports

ALTER TABLE fields DROP COLUMN IF EXISTS "type";
