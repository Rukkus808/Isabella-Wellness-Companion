// PAYMENT ROUTES
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimit');
const { createCheckoutSession, handleWebhook, PLANS } = require('../payments/stripe');
const paypal = require('../payments/paypal');

// GET /api/payments/plans
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      { tier: 'free', name: 'Community Edition', price: 'Free', features: ['Twenty-five messages per day', 'All games', 'Crisis resources always active', 'Basic wellness monitoring'] },
      { tier: 'developer', name: 'Developer', price: 'ninety-nine dollars per month', features: ['Unlimited messages', 'VaultACE API access', 'Relationship governance', 'Advanced HIWM signals', 'Priority support'] },
      { tier: 'professional', name: 'Professional', price: 'four hundred ninety-nine dollars per month', features: ['Everything in Developer', 'Multi-user deployment', 'Custom Isabella persona', 'Audit dashboard', 'SLA support'] },
      { tier: 'enterprise', name: 'Enterprise', price: 'two thousand nine hundred ninety-nine dollars per month', features: ['Everything in Professional', 'On-premise deployment', 'Custom safety policy', 'Dedicated support', 'Contact VaultACE@vaultagon.com'] }
    ]
  });
});

// POST /api/payments/stripe/checkout
router.post('/stripe/checkout', authenticateToken, paymentLimiter, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['developer', 'professional', 'enterprise'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const session = await createCheckoutSession(req.user.userId, req.user.email, tier);
    res.json({ url: session.url });
  } catch {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/stripe/webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await handleWebhook(req.body, signature);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
});

// POST /api/payments/paypal/create
router.post('/paypal/create', authenticateToken, paymentLimiter, async (req, res) => {
  try {
    const { tier } = req.body;
    const subscription = await paypal.createSubscription(req.user.userId, tier);
    res.json({ subscription });
  } catch {
    res.status(500).json({ error: 'Failed to create PayPal subscription' });
  }
});

// POST /api/payments/paypal/webhook
router.post('/paypal/webhook', async (req, res) => {
  try {
    const result = await paypal.handleWebhook(req.body, req.headers);
    res.json(result);
  } catch {
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
