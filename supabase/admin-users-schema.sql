-- Admin Users Schema Migration
-- Run this in the Supabase SQL Editor to add admin authentication
-- This adds brute force protection with login attempt tracking

-- ============================================
-- ADMIN_USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT concat('admin_', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 8)),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- Brute force protection
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_login TIMESTAMPTZ,

  -- Audit fields
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- ============================================
-- LOGIN_ATTEMPTS TABLE (for detailed audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY DEFAULT concat('la_', to_hex(extract(epoch from now())::bigint), substr(md5(random()::text), 1, 8)),
  username TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying recent attempts
CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access admin_users (no public access)
CREATE POLICY "Service role only on admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only on login_attempts" ON login_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTION: Check if account is locked
-- ============================================
CREATE OR REPLACE FUNCTION is_account_locked(user_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  lock_time TIMESTAMPTZ;
BEGIN
  SELECT locked_until INTO lock_time
  FROM admin_users
  WHERE username = user_username;

  IF lock_time IS NULL THEN
    RETURN false;
  END IF;

  RETURN lock_time > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Record failed login attempt
-- ============================================
CREATE OR REPLACE FUNCTION record_failed_login(user_username TEXT)
RETURNS void AS $$
DECLARE
  current_attempts INTEGER;
  max_attempts INTEGER := 5;
  lockout_duration INTERVAL := '15 minutes';
BEGIN
  -- Get current failed attempts
  SELECT failed_login_attempts INTO current_attempts
  FROM admin_users
  WHERE username = user_username;

  IF current_attempts IS NULL THEN
    RETURN; -- User doesn't exist, do nothing
  END IF;

  current_attempts := current_attempts + 1;

  -- Update the user record
  IF current_attempts >= max_attempts THEN
    -- Lock the account
    UPDATE admin_users
    SET failed_login_attempts = current_attempts,
        last_failed_login = NOW(),
        locked_until = NOW() + lockout_duration,
        updated_at = NOW()
    WHERE username = user_username;
  ELSE
    UPDATE admin_users
    SET failed_login_attempts = current_attempts,
        last_failed_login = NOW(),
        updated_at = NOW()
    WHERE username = user_username;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Record successful login
-- ============================================
CREATE OR REPLACE FUNCTION record_successful_login(user_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE admin_users
  SET failed_login_attempts = 0,
      locked_until = NULL,
      last_failed_login = NULL,
      last_login = NOW(),
      updated_at = NOW()
  WHERE username = user_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- Password will be set via the setup script
-- ============================================
-- NOTE: Run the setup script to create the admin user with a hashed password
-- DO NOT insert plaintext passwords here!
