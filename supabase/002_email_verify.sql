-- Add email verification columns to app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS verify_token TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS verify_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_app_users_verify_token ON app_users(verify_token) WHERE verify_token IS NOT NULL;

-- Auto-verify existing users
UPDATE app_users SET email_verified = TRUE WHERE email_verified IS NULL;

NOTIFY pgrst, 'reload schema';
