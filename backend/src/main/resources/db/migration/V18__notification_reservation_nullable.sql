-- Allow reservation_id to be NULL for non-reservation notifications (password reset, admin invite)
ALTER TABLE notifications ALTER COLUMN reservation_id DROP NOT NULL;
