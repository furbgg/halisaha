-- Persistent rate limiting: survives application restarts
CREATE TABLE login_rate_limits (
    id BIGSERIAL PRIMARY KEY,
    rate_key VARCHAR(255) NOT NULL UNIQUE,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    window_start_millis BIGINT NOT NULL
);

CREATE INDEX idx_rate_limits_key ON login_rate_limits(rate_key);
