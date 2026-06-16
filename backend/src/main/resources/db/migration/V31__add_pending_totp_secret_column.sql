-- Pending TOTP secret: stored during 2FA setup, cleared after verification
ALTER TABLE users ADD COLUMN pending_totp_secret TEXT;
