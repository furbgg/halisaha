-- V16: Convert all TIMESTAMP columns to TIMESTAMP WITH TIME ZONE (DST-safe)
-- Existing data is interpreted as Europe/Vienna local time.

-- ==================== reservations ====================
ALTER TABLE reservations
    ALTER COLUMN start_time            TYPE TIMESTAMPTZ USING start_time            AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN end_time              TYPE TIMESTAMPTZ USING end_time              AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN privacy_accepted_at   TYPE TIMESTAMPTZ USING privacy_accepted_at   AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN notification_consent_at TYPE TIMESTAMPTZ USING notification_consent_at AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN paid_at               TYPE TIMESTAMPTZ USING paid_at               AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN refunded_at           TYPE TIMESTAMPTZ USING refunded_at           AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN cancelled_at          TYPE TIMESTAMPTZ USING cancelled_at          AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN created_at            TYPE TIMESTAMPTZ USING created_at            AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN updated_at            TYPE TIMESTAMPTZ USING updated_at            AT TIME ZONE 'Europe/Vienna';

-- ==================== slot_holds ====================
ALTER TABLE slot_holds
    ALTER COLUMN start_time  TYPE TIMESTAMPTZ USING start_time  AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN expires_at  TYPE TIMESTAMPTZ USING expires_at  AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== notifications ====================
ALTER TABLE notifications
    ALTER COLUMN sent_at     TYPE TIMESTAMPTZ USING sent_at     AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== payments ====================
ALTER TABLE payments
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== users ====================
ALTER TABLE users
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== staff ====================
ALTER TABLE staff
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== equipment ====================
ALTER TABLE equipment
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna',
    ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== equipment_rentals ====================
ALTER TABLE equipment_rentals
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== audit_log ====================
ALTER TABLE audit_log
    ALTER COLUMN created_at  TYPE TIMESTAMPTZ USING created_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== app_settings ====================
ALTER TABLE app_settings
    ALTER COLUMN updated_at  TYPE TIMESTAMPTZ USING updated_at  AT TIME ZONE 'Europe/Vienna';

-- ==================== processed_events (may not exist yet) ====================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'processed_events') THEN
    ALTER TABLE processed_events
        ALTER COLUMN processed_at TYPE TIMESTAMPTZ USING processed_at AT TIME ZONE 'Europe/Vienna';
  END IF;
END $$;
