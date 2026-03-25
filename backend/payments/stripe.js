// STRIPE PAYMENT INTEGRATION
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PLANS = {
  developer: {
    priceId: process.env.STRIPE_PRICE_DEVELOPER,
    name: 'Developer',
    amount: 'ninety-nine dollars per month'
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    name: 'Professional',
    amount: 'four hundred ninety-nine dollars per month'
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    name: 'Enterprise',
    amount: 'two thousand nine hundred ninety-nine dollars per month'
  }
};

async function createCheckoutSession(userId, email, tier) {
  const plan = PLANS[tier];
  if (!plan) throw new Error('Invalid subscription tier');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscribe/cancel`,
    metadata: { userId: String(userId), tier }
  });

  return session;
}

async function handleWebhook(rawBody, signature) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, tier } = session.metadata;

      await pool.query(
        `UPDATE users SET subscription_tier = $1, stripe_customer_id = $2,
         subscription_expires_at = NOW() + INTERVAL '1 month' WHERE id = $3`,
        [tier, session.customer, userId]
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await pool.query(
        `UPDATE users SET subscription_tier = 'free', subscription_expires_at = NULL
         WHERE stripe_customer_id = $1`,
        [sub.customer]
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await pool.query(
        `UPDATE users SET subscription_tier = 'free' WHERE stripe_customer_id = $1`,
        [invoice.customer]
      );
      break;
    }
  }

  return { received: true };
}

module.exports = { createCheckoutSession, handleWebhook, PLANS };
