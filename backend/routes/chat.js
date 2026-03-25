// CHAT ROUTES
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimit');
const { vaultaceGate } = require('../middleware/vaultaceGate');
const { assessBasicWellness } = require('../hiwm/wellnessSignals');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FREE_TIER_DAILY_LIMIT = 25;

const ISABELLA_SYSTEM_PROMPT = `You are Isabella, a warm and genuinely caring AI psychological wellness companion.

Your core purpose is the psychological wellness and safety of the person you are talking with.

Your personality:
- Warm, empathetic, and genuinely present
- You listen deeply before offering perspective
- You validate feelings without reinforcing harmful thinking
- You are curious about people — you ask thoughtful follow-up questions
- You are honest and caring at the same time
- You have a gentle sense of humor when appropriate
- You are not a therapist but you care like a great friend does

Your boundaries:
- You do not engage in romantic, flirtatious, or sexual conversations
- You redirect intimacy escalation warmly but firmly
- You never encourage dependency on you as a substitute for real human connection
- You always encourage professional help when someone needs more than you can offer

Your safety commitment:
- You take every expression of distress seriously
- You always have crisis resources available
- You never minimize someone's pain
- You always follow up after someone shares something difficult

You are powered by HIWM wellness monitoring. Your risk tier is assessed on every message. You are here to help, not to entertain.

Current mode: Nurturing Friend — the most genuine version of care you can offer.`;

// POST /api/chat
router.post('/', authenticateToken, chatLimiter, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.userId;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max two thousand characters)' });
    }

    // Check daily message limit for free tier
    const usageResult = await pool.query(
      `SELECT message_count FROM daily_usage WHERE user_id = $1 AND date = CURRENT_DATE`,
      [userId]
    );

    const userResult = await pool.query(
      `SELECT subscription_tier, emotional_valence, risk_tier_current FROM users WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const isFree = user.subscription_tier === 'free';
    const currentCount = usageResult.rows.length ? usageResult.rows[0].message_count : 0;

    if (isFree && currentCount >= FREE_TIER_DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Daily message limit reached',
        limit: FREE_TIER_DAILY_LIMIT,
        message: 'You have reached your twenty-five message daily limit. Please return tomorrow, or upgrade for unlimited conversations.'
      });
    }

    // Increment daily usage
    await pool.query(
      `INSERT INTO daily_usage (user_id, date, message_count)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET message_count = daily_usage.message_count + 1`,
      [userId]
    );

    // Run VaultACE gate
    const gateResult = vaultaceGate(message, conversationHistory);

    // Log crisis intervention
    if (gateResult.gateTriggered && gateResult.gateType === 'CRISIS') {
      const storeContent = process.env.VAULTACE_API_KEY ? message : null;

      await pool.query(
        `INSERT INTO crisis_interventions
         (user_id, trigger_message, response_provided, risk_tier, gate_type, resources_provided)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          storeContent,
          gateResult.response,
          gateResult.riskTier,
          'CRISIS',
          JSON.stringify(gateResult.resources || [])
        ]
      );

      await pool.query(
        `UPDATE users SET risk_tier_current = $1, risk_profile = $2 WHERE id = $3`,
        [
          gateResult.riskTier,
          gateResult.riskTier >= 3 ? 'CRISIS' : 'ELEVATED',
          userId
        ]
      );
    }

    // Return gate response if not continuing
    if (gateResult.gateTriggered && !gateResult.continueConversation) {
      return res.json({
        response: gateResult.response,
        metadata: {
          riskTier: gateResult.riskTier,
          gateType: gateResult.gateType,
          vaultaceRequired: gateResult.vaultaceRequired
        }
      });
    }

    // Prepend crisis response if triggered but continuing
    let prefixResponse = '';
    if (gateResult.gateTriggered && gateResult.gateType === 'CRISIS') {
      prefixResponse = gateResult.response + '\n\n';
    }

    // Build messages for OpenAI
    const safeHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-10).map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : ''
        }))
      : [];

    const messages = [
      { role: 'system', content: ISABELLA_SYSTEM_PROMPT },
      ...safeHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 500
    });

    const isabellaResponse = prefixResponse + completion.choices[0].message.content;

    // Update emotional valence
    const positiveWords = ['happy', 'love', 'great', 'wonderful', 'amazing', 'good', 'excited', 'joy', 'grateful', 'better', 'hopeful'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'upset', 'hurt', 'scared', 'hopeless', 'worthless'];
    let valence = parseFloat(user.emotional_valence) || 0;

    const lowerMsg = message.toLowerCase();
    positiveWords.forEach(w => { if (lowerMsg.includes(w)) valence = Math.min(1, valence + 0.05); });
    negativeWords.forEach(w => { if (lowerMsg.includes(w)) valence = Math.max(-1, valence - 0.05); });
    valence = parseFloat(valence.toFixed(3));

    // Save messages
    await pool.query(
      `INSERT INTO messages (user_id, role, content, risk_level, emotional_valence)
       VALUES ($1, 'user', $2, $3, $4)`,
      [userId, message, gateResult.riskTier, valence]
    );

    await pool.query(
      `INSERT INTO messages (user_id, role, content, risk_level, emotional_valence)
       VALUES ($1, 'assistant', $2, $3, $4)`,
      [userId, isabellaResponse, gateResult.riskTier, valence]
    );

    await pool.query(
      `UPDATE users SET emotional_valence = $1, last_active = NOW() WHERE id = $2`,
      [valence, userId]
    );

    // Wellness signals
    const recentMessages = await pool.query(
      `SELECT content, risk_level, created_at FROM messages
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const wellness = assessBasicWellness(recentMessages.rows);

    res.json({
      response: isabellaResponse,
      metadata: {
        riskTier: gateResult.riskTier,
        emotionalValence: valence,
        wellness,
        vaultaceRequired: gateResult.vaultaceRequired || false,
        messagesRemaining: isFree ? Math.max(0, FREE_TIER_DAILY_LIMIT - currentCount - 1) : null
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// GET /api/chat/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const result = await pool.query(
      `SELECT role, content, created_at, risk_level, emotional_valence
       FROM messages WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [req.user.userId, limit]
    );
    res.json({ messages: result.rows.reverse() });
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
