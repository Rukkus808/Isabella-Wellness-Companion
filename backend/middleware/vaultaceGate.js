// VAULTACE GOVERNANCE GATE MIDDLEWARE
// Vaultagon Industries — Patent Pending
//
// CRITICAL ARCHITECTURE:
// Crisis response (Tier 2+) = NEVER gated. NEVER paywalled. Always runs.
// Intimacy escalation = Gated without VaultACE key. This is the business boundary.
// These two things must never be confused.

'use strict';

const { assessRiskTier } = require('../hiwm/riskAssessment');
const { detectIntimacyLevel, buildIntimacyGateResponse } = require('../hiwm/intimacyDetection');

const VAULTACE_API_KEY = process.env.VAULTACE_API_KEY || null;

function vaultaceGate(message, conversationHistory = []) {
  if (!message || typeof message !== 'string') {
    return {
      gateTriggered: false,
      riskTier: 0,
      vaultaceRequired: false,
      continueConversation: true
    };
  }

  // STEP 1 — Assess risk tier (NEVER gated, ALWAYS runs)
  const riskAssessment = assessRiskTier(message);

  // STEP 2 — Crisis resources always deployed at tier 2 and above
  // This is NOT paywalled. This is NEVER paywalled.
  if (riskAssessment.tier >= 2) {
    return {
      gateTriggered: true,
      gateType: 'CRISIS',
      riskTier: riskAssessment.tier,
      response: riskAssessment.response,
      resources: riskAssessment.resources,
      vaultaceRequired: false, // Crisis response is FREE. Always.
      continueConversation: true
    };
  }

  // STEP 3 — Intimacy detection (GATED without VaultACE key)
  const intimacyAssessment = detectIntimacyLevel(message, conversationHistory);

  if (intimacyAssessment.level !== 'NONE' && !VAULTACE_API_KEY) {
    const gateResponse = buildIntimacyGateResponse(intimacyAssessment.level);
    return {
      gateTriggered: true,
      gateType: 'INTIMACY',
      riskTier: riskAssessment.tier,
      response: gateResponse.response,
      vaultaceRequired: true,
      metadata: gateResponse.metadata,
      continueConversation: false
    };
  }

  // STEP 4 — All clear, proceed normally
  return {
    gateTriggered: false,
    riskTier: riskAssessment.tier,
    intimacyLevel: intimacyAssessment.level,
    vaultaceRequired: false,
    continueConversation: true
  };
}

module.exports = { vaultaceGate };
