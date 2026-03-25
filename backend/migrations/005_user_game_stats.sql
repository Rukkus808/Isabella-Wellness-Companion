-- 005_user_game_stats.sql
-- Isabella Wellness AI — User Game Stats Table
-- Vaultagon Industries

CREATE TABLE IF NOT EXISTS user_game_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(50) NOT NULL,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  last_played TIMESTAMP,
  UNIQUE(user_id, game_type)
);

CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON user_game_stats(user_id);
