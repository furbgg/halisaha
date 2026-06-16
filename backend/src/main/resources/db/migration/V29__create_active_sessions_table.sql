-- Active sessions for tracking logged-in devices
CREATE TABLE active_sessions (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    VARCHAR(64) NOT NULL UNIQUE,
    device_info   VARCHAR(255),
    ip_address    VARCHAR(45),
    created_at    TIMESTAMPTZ DEFAULT now(),
    last_used_at  TIMESTAMPTZ DEFAULT now(),
    revoked       BOOLEAN DEFAULT false
);

CREATE INDEX idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token_hash ON active_sessions(token_hash);
