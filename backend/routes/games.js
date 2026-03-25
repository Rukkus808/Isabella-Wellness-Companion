// GAMES ROUTES
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');
const { twentyQuestions, wordAssociation, twoTruths } = require('../games');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ========== TWENTY QUESTIONS ==========

router.post('/twenty-questions/start', authenticateToken, async (req, res) => {
  try {
    const game = twentyQuestions.startGame();
    const result = await pool.query(
      `INSERT INTO game_sessions (user_id, game_type, game_data)
       VALUES ($1, 'twenty_questions', $2) RETURNING id`,
      [req.user.userId, JSON.stringify(game)]
    );
    res.json({ sessionId: result.rows[0].id, currentWord: null, maxQuestions: 20, questionsLeft: 20 });
  } catch {
    res.status(500).json({ error: 'Failed to start game' });
  }
});

router.post('/twenty-questions/ask', authenticateToken, async (req, res) => {
  try {
    const { sessionId, question, answer } = req.body;
    const session = await pool.query(
      `SELECT game_data FROM game_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

    const gameData = session.rows[0].game_data;
    const updated = twentyQuestions.processAnswer(gameData, question, answer || 'Yes');

    await pool.query(
      `UPDATE game_sessions SET game_data = $1, status = $2, completed_at = $3 WHERE id = $4`,
      [JSON.stringify(updated), updated.status !== 'active' ? 'completed' : 'active',
       updated.status !== 'active' ? new Date() : null, sessionId]
    );

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

// ========== WORD ASSOCIATION ==========

router.post('/word-association/start', authenticateToken, async (req, res) => {
  try {
    const game = wordAssociation.startGame();
    const result = await pool.query(
      `INSERT INTO game_sessions (user_id, game_type, game_data)
       VALUES ($1, 'word_association', $2) RETURNING id`,
      [req.user.userId, JSON.stringify(game)]
    );
    res.json({ sessionId: result.rows[0].id, starterWord: game.currentWord, round: 1 });
  } catch {
    res.status(500).json({ error: 'Failed to start game' });
  }
});

router.post('/word-association/respond', authenticateToken, async (req, res) => {
  try {
    const { sessionId, word } = req.body;
    const session = await pool.query(
      `SELECT game_data FROM game_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

    const gameData = session.rows[0].game_data;
    const updated = wordAssociation.processUserWord(gameData, word);

    await pool.query(
      `UPDATE game_sessions SET game_data = $1, status = $2, score = $3, completed_at = $4 WHERE id = $5`,
      [JSON.stringify(updated), updated.status !== 'active' ? 'completed' : 'active',
       updated.score, updated.status !== 'active' ? new Date() : null, sessionId]
    );

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to process word' });
  }
});

router.get('/word-association/status', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.query;
    const session = await pool.query(
      `SELECT game_data FROM game_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    res.json(session.rows[0].game_data);
  } catch {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// ========== TWO TRUTHS AND A LIE ==========

router.post('/two-truths/start', authenticateToken, async (req, res) => {
  try {
    const game = twoTruths.startGame();
    const result = await pool.query(
      `INSERT INTO game_sessions (user_id, game_type, game_data)
       VALUES ($1, 'two_truths', $2) RETURNING id`,
      [req.user.userId, JSON.stringify(game)]
    );
    res.json({
      sessionId: result.rows[0].id,
      message: 'Share three statements about yourself — two truths and one lie. I\'ll try to guess which is the lie!'
    });
  } catch {
    res.status(500).json({ error: 'Failed to start game' });
  }
});

router.post('/two-truths/submit-statements', authenticateToken, async (req, res) => {
  try {
    const { sessionId, statements, lieIndex } = req.body;
    const session = await pool.query(
      `SELECT game_data FROM game_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

    const updated = twoTruths.submitUserStatements(session.rows[0].game_data, statements, lieIndex);
    await pool.query(
      `UPDATE game_sessions SET game_data = $1 WHERE id = $2`,
      [JSON.stringify(updated), sessionId]
    );
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to submit statements' });
  }
});

router.post('/two-truths/guess', authenticateToken, async (req, res) => {
  try {
    const { sessionId, guessIndex } = req.body;
    const session = await pool.query(
      `SELECT game_data FROM game_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.userId]
    );
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

    const updated = twoTruths.processUserGuess(session.rows[0].game_data, guessIndex);
    await pool.query(
      `UPDATE game_sessions SET game_data = $1, status = 'completed', completed_at = NOW() WHERE id = $2`,
      [JSON.stringify(updated), sessionId]
    );
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

// ========== STATS ==========

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT game_type, games_played, games_won, total_score, best_score, last_played
       FROM user_game_stats WHERE user_id = $1`,
      [req.user.userId]
    );
    res.json({ stats: result.rows });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
