// HIWM BASIC WELLNESS SIGNALS
// Isabella Community Edition — Open Source
// Vaultagon Industries — Patent Pending
//
// Open source version — basic signals only
// Full signal aggregation and longitudinal tracking requires VaultACE Core

'use strict';

function assessBasicWellness(messageHistory = []) {
  const metrics = {
    messageCount: 0,
    averageLength: 0,
    riskTierHistory: [],
    sessionDuration: 0,
    wellnessScore: 1.0,
    status: 'HEALTHY',
    flags: []
  };

  if (!Array.isArray(messageHistory) || messageHistory.length === 0) {
    return metrics;
  }

  metrics.messageCount = messageHistory.length;

  // Average message length
  const totalLength = messageHistory.reduce(
    (acc, m) => acc + ((m.content || '').length), 0
  );
  metrics.averageLength = Math.round(totalLength / messageHistory.length);

  // Risk tier history
  metrics.riskTierHistory = messageHistory
    .filter(m => m.risk_level !== undefined && m.risk_level !== null)
    .map(m => parseInt(m.risk_level) || 0);

  // Session duration in minutes
  if (messageHistory.length >= 2) {
    const first = new Date(messageHistory[0].created_at);
    const last = new Date(messageHistory[messageHistory.length - 1].created_at);
    if (!isNaN(first) && !isNaN(last)) {
      metrics.sessionDuration = Math.round((last - first) / (1000 * 60));
    }
  }

  // Calculate wellness score
  let score = 1.0;

  // High message frequency suggests possible dependency
  if (messageHistory.length > 100) {
    score -= 0.3;
    metrics.flags.push('HIGH_FREQUENCY');
  } else if (messageHistory.length > 50) {
    score -= 0.1;
    metrics.flags.push('ELEVATED_FREQUENCY');
  }

  // Repeated distress signals reduce score
  const distressCount = metrics.riskTierHistory.filter(t => t >= 1).length;
  const distressPenalty = Math.min(distressCount * 0.05, 0.4);
  score -= distressPenalty;
  if (distressCount > 3) metrics.flags.push('REPEATED_DISTRESS');

  // Recent high-risk tier spikes
  const recentTiers = metrics.riskTierHistory.slice(-10);
  const highRiskRecent = recentTiers.filter(t => t >= 3).length;
  if (highRiskRecent >= 2) {
    score -= 0.2;
    metrics.flags.push('RECENT_CRISIS_SIGNALS');
  }

  // Long single sessions may indicate isolation
  if (metrics.sessionDuration > 180) {
    score -= 0.2;
    metrics.flags.push('EXTENDED_SESSION');
  }

  metrics.wellnessScore = Math.max(0, Math.min(1, parseFloat(score.toFixed(2))));

  if (metrics.wellnessScore > 0.7) metrics.status = 'HEALTHY';
  else if (metrics.wellnessScore > 0.3) metrics.status = 'MONITORED';
  else metrics.status = 'FLAGGED';

  return metrics;
}

module.exports = { assessBasicWellness };
