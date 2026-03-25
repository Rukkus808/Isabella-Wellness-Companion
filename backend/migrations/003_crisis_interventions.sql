-- 003_crisis_interventions.sql
-- Isabella Wellness AI — Crisis Interventions Table
-- Vaultagon Industries
--
-- NOTE: trigger_message content is NOT stored in open source deployments
-- unless VAULTACE_API_KEY is present. Privacy by default.

CREATE TABLE IF NOT EXISTS crisis_interventions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger_message TEXT, -- NULL in open source unless VaultACE active
  response_provided TEXT NOT NULL,
  risk_tier INTEGER NOT NULL,
  gate_type VARCHAR(50) NOT NULL DEFAULT 'CRISIS',
  resources_provided JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crisis_user_id ON crisis_interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_created_at ON crisis_interventions(created_at);
CREATE INDEX IF NOT EXISTS idx_crisis_risk_tier ON crisis_interventions(risk_tier);

CREATE TABLE IF NOT EXISTS risk_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_events_user_id ON risk_events(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_created_at ON risk_events(created_at);
