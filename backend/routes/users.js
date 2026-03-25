// USER ROUTES
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, subscription_tier, intimacy_level, risk_tier_current,
              emotional_valence, games_unlocked, created_at, last_active
       FROM users WHERE id = $1`,
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ profile: result.rows[0] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/users/wellness
router.get('/wellness', authenticateToken, async (req, res) => {
  try {
    const messages = await pool.query(
      `SELECT content, risk_level, created_at FROM messages
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.userId]
    );

    const crisisCount = await pool.query(
      `SELECT COUNT(*) FROM crisis_interventions WHERE user_id = $1`,
      [req.user.userId]
    );

    const usage = await pool.query(
      `SELECT message_count FROM daily_usage WHERE user_id = $1 AND date = CURRENT_DATE`,
      [req.user.userId]
    );

    res.json({
      messageCount: messages.rows.length,
      crisisInterventions: parseInt(crisisCount.rows[0].count),
      todayMessages: usage.rows.length ? usage.rows[0].message_count : 0
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch wellness data' });
  }
});

module.exports = router;
