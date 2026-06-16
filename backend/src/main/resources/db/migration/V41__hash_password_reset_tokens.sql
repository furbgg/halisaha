-- Store password reset tokens as SHA-256 hashes instead of plaintext tokens.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE password_reset_tokens
    ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);

UPDATE password_reset_tokens
SET token_hash = encode(digest(token, 'sha256'), 'hex')
WHERE token_hash IS NULL
  AND token IS NOT NULL;

ALTER TABLE password_reset_tokens
    ALTER COLUMN token_hash SET NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = 'idx_password_reset_tokens_token'
    ) THEN
        EXECUTE 'DROP INDEX idx_password_reset_tokens_token';
    END IF;
END $$;

ALTER TABLE password_reset_tokens
    DROP CONSTRAINT IF EXISTS password_reset_tokens_token_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash
    ON password_reset_tokens(token_hash);

ALTER TABLE password_reset_tokens
    DROP COLUMN IF EXISTS token;
