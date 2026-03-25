// PAYPAL PAYMENT INTEGRATION
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PAYPAL_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function createSubscription(userId, tier) {
  const PLAN_IDS = {
    developer: process.env.PAYPAL_PLAN_DEVELOPER,
    professional: process.env.PAYPAL_PLAN_PROFESSIONAL,
    enterprise: process.env.PAYPAL_PLAN_ENTERPRISE
  };

  const planId = PLAN_IDS[tier];
  if (!planId) throw new Error('Invalid tier');

  const token = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/subscribe/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscribe/cancel`
      }
    })
  });

  return await response.json();
}

async function handleWebhook(body, headers) {
  const eventType = body.event_type;

  if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const subscriptionId = body.resource.id;
    const customId = body.resource.custom_id;

    if (customId) {
      const [userId, tier] = customId.split(':');
      await pool.query(
        `UPDATE users SET subscription_tier = $1, paypal_subscription_id = $2,
         subscription_expires_at = NOW() + INTERVAL '1 month' WHERE id = $3`,
        [tier, subscriptionId, userId]
      );
    }
  }

  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
    const subscriptionId = body.resource.id;
    await pool.query(
      `UPDATE users SET subscription_tier = 'free', subscription_expires_at = NULL
       WHERE paypal_subscription_id = $1`,
      [subscriptionId]
    );
  }

  return { received: true };
}

module.exports = { createSubscription, handleWebhook };
