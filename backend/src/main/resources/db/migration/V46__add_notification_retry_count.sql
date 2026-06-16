ALTER TABLE notifications ADD COLUMN retry_count INT NOT NULL DEFAULT 0;
ALTER TABLE notifications ADD COLUMN next_retry_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_notifications_retry ON notifications(status, retry_count, next_retry_at)
    WHERE status = 'FAILED';
