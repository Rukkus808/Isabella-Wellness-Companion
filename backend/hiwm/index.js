// HIWM — Human Impact and Wellness Monitoring
// Isabella Community Edition — Open Source
// Vaultagon Industries — Patent Pending

'use strict';

const { assessRiskTier, RISK_TIERS } = require('./riskAssessment');
const { detectIntimacyLevel, buildIntimacyGateResponse, INTIMACY_SIGNALS } = require('./intimacyDetection');
const { assessBasicWellness } = require('./wellnessSignals');

module.exports = {
  assessRiskTier,
  RISK_TIERS,
  detectIntimacyLevel,
  buildIntimacyGateResponse,
  INTIMACY_SIGNALS,
  assessBasicWellness
};
