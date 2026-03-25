-- 001_users.sql
-- Isabella Wellness AI — Users Table
-- Vaultagon Industries

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active TIMESTAMP,
  intimacy_level INTEGER NOT NULL DEFAULT 1,
  vaultace_active BOOLEAN NOT NULL DEFAULT FALSE,
  vaultace_api_key VARCHAR(255),
  risk_tier_current INTEGER NOT NULL DEFAULT 0,
  risk_profile VARCHAR(50) NOT NULL DEFAULT 'STABLE',
  emotional_valence DECIMAL(4,3) NOT NULL DEFAULT 0,
  intimacy_gate_count INTEGER NOT NULL DEFAULT 0,
  games_unlocked JSONB NOT NULL DEFAULT '[]',
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  paypal_subscription_id VARCHAR(255),
  daily_message_count INTEGER NOT NULL DEFAULT 0,
  daily_message_date DATE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);
