-- 002_messages.sql
-- Isabella Wellness AI — Messages Table
-- Vaultagon Industries

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  risk_level INTEGER NOT NULL DEFAULT 0,
  emotional_valence DECIMAL(4,3) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_risk_level ON messages(risk_level);

CREATE TABLE IF NOT EXISTS daily_usage (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, date)
);
