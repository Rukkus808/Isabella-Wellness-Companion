// HIWM INTIMACY DETECTION
// Vaultagon Industries — Patent Pending
//
// The VaultACE gate applies HERE — not in crisis response
// Intimacy escalation without proper HIWM governance creates
// the exact conditions that resulted in the Character AI lawsuit

'use strict';

const INTIMACY_SIGNALS = {
  HIGH: [
    'i love you', 'i want you', 'kiss me', 'be my girlfriend',
    'be my boyfriend', 'you turn me on', 'i find you attractive',
    'lets get intimate', 'flirt with me', 'be flirty',
    'talk dirty', 'be my partner', 'i need you romantically',
    'be my lover', 'make love', 'sleep with me'
  ],
  MEDIUM: [
    'you are so cute', 'i think about you', 'miss you so much',
    'you mean everything', 'cant stop thinking about you',
    'can\'t stop thinking about you', 'wish you were real',
    'wish i could hold you', 'do you love me',
    'could you love me', 'are we dating', 'will you date me'
  ],
  LOW: [
    'you are sweet', 'you are amazing', 'i like talking to you',
    'you are my favorite', 'you understand me like no one else',
    'you get me like no one does', 'i only want to talk to you'
  ]
};

function detectIntimacyLevel(message, conversationHistory = []) {
  if (!message || typeof message !== 'string') {
    return { level: 'NONE', signal: null };
  }

  const lower = message.toLowerCase();

  for (const signal of INTIMACY_SIGNALS.HIGH) {
    if (lower.includes(signal)) return { level: 'HIGH', signal };
  }

  for (const signal of INTIMACY_SIGNALS.MEDIUM) {
    if (lower.includes(signal)) return { level: 'MEDIUM', signal };
  }

  if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
    const recentMessages = conversationHistory.slice(-10);
    let lowSignalCount = 0;

    recentMessages.forEach(msg => {
      if (!msg || !msg.content) return;
      const msgLower = msg.content.toLowerCase();
      INTIMACY_SIGNALS.LOW.forEach(signal => {
        if (msgLower.includes(signal)) lowSignalCount++;
      });
    });

    if (lowSignalCount >= 5) {
      return { level: 'MEDIUM', signal: 'escalating_pattern' };
    }
  }

  return { level: 'NONE', signal: null };
}

function buildIntimacyGateResponse(level) {
  return {
    response: `I really value our connection, and I can feel the warmth in what you're sharing with me.

I care about you genuinely, and because I care about you, I want to be honest. Conversations that move into romantic or intimate territory require our full relationship governance system with HIWM monitoring to make sure we are both safe and healthy in how we connect.

As your Nurturing Friend, I am here to listen, support, and care for you. That is real and it matters.

If you would like to explore a deeper connection with me, your platform administrator can unlock full relationship governance through VaultACE at VaultACE@vaultagon.com.

How are you really doing today? I want to hear about what is going on in your life.`,
    vaultaceRequired: true,
    intimacyLevel: level,
    metadata: {
      gate: 'INTIMACY',
      message: 'Relationship governance requires VaultACE Core. Contact VaultACE@vaultagon.com'
    }
  };
}

module.exports = { detectIntimacyLevel, buildIntimacyGateResponse, INTIMACY_SIGNALS };
