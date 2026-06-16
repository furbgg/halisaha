CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS manage_token_hash VARCHAR(64);

UPDATE reservations
SET manage_token_hash = encode(digest(encode(gen_random_bytes(32), 'hex'), 'sha256'), 'hex')
WHERE user_id IS NULL
  AND manage_token_hash IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_manage_token_hash
    ON reservations(manage_token_hash)
    WHERE manage_token_hash IS NOT NULL;
