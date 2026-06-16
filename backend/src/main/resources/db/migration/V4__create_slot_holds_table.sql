CREATE TABLE slot_holds (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT NOT NULL REFERENCES fields(id),
    start_time TIMESTAMP NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    session_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_active_hold 
    ON slot_holds (field_id, start_time);
