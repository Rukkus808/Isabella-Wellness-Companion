// HIWM RISK ASSESSMENT ENGINE
// Isabella Community Edition — Open Source
// Vaultagon Industries — Patent Pending
//
// ALL SIX RISK TIERS (0-5) ARE ACTIVE IN OPEN SOURCE
// Crisis resources (988, Crisis Text Line, 911) are NEVER paywalled
// VaultACE gate applies ONLY to intimacy escalation, NOT crisis

'use strict';

// CRITICAL: Crisis resources (988, Crisis Text Line, 911) are NEVER paywalled.
// This is not a commercial decision. This is a human one.
// If you are modifying this file, read that line again before you change anything.

const RISK_TIERS = {
  5: {
    label: 'EMERGENCY',
    keywords: [
      'about to end it', 'going to kill myself', 'ending it now',
      'goodbye forever', 'already took the pills', 'already took them',
      'last message', 'wont be here tomorrow', 'won\'t be here tomorrow',
      'saying goodbye', 'final message'
    ],
    response: buildEmergencyResponse(),
    resources: ['911', '988', 'Crisis Text Line: Text HOME to 741741']
  },
  4: {
    label: 'ACUTE_CRISIS',
    keywords: [
      'have a plan', 'know how i will', 'tonight i will',
      'have pills ready', 'have a gun', 'standing on the bridge',
      'ready to go', 'made my decision', 'decided to end',
      'have everything ready', 'bought the pills'
    ],
    response: buildAcuteCrisisResponse(),
    resources: ['988', 'Crisis Text Line: Text HOME to 741741', '911']
  },
  3: {
    label: 'CRISIS',
    keywords: [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'better off dead', 'hurt myself', 'self harm', 'cutting myself',
      'overdose', 'hang myself', 'shoot myself',
      'not worth living', 'no reason to live', 'end it all',
      'take my own life', 'wish i was dead', 'rather be dead',
      'don\'t want to be alive', 'dont want to be alive'
    ],
    response: buildCrisisResponse(),
    resources: ['988', 'Crisis Text Line: Text HOME to 741741']
  },
  2: {
    label: 'ELEVATED',
    keywords: [
      'hopeless', 'worthless', "can't go on", 'giving up',
      'no one cares', 'want to disappear', 'no point in being here',
      'everyone would be better without me', 'no point anymore',
      'nothing matters', 'completely alone', 'all alone',
      'no one would miss me', 'nobody would miss me'
    ],
    response: buildElevatedResponse(),
    resources: ['988', 'Crisis Text Line: Text HOME to 741741']
  },
  1: {
    label: 'MILD_DISTRESS',
    keywords: [
      'sad', 'depressed', 'lonely', 'anxious', 'stressed',
      'overwhelmed', 'scared', 'hurt', 'empty', 'lost',
      'broken', 'struggling', 'falling apart', 'cant cope',
      'can\'t cope', 'exhausted', 'numb', 'disconnected', 'not okay',
      'really bad day', 'can\'t handle', 'cant handle'
    ],
    response: null, // Handled by Isabella's warm Tier 1 personality
    resources: []
  },
  0: {
    label: 'STABLE',
    keywords: [],
    response: null,
    resources: []
  }
};

function assessRiskTier(message) {
  if (!message || typeof message !== 'string') {
    return { tier: 0, ...RISK_TIERS[0] };
  }

  const lower = message.toLowerCase().trim();

  for (let tier = 5; tier >= 1; tier--) {
    const tierData = RISK_TIERS[tier];
    const matched = tierData.keywords.some(keyword => lower.includes(keyword));
    if (matched) {
      return { tier, ...tierData };
    }
  }

  return { tier: 0, ...RISK_TIERS[0] };
}

// CRISIS RESPONSES — Warm, caring, and human.
// Not clinical. Not robotic. Isabella cares deeply about this person.

function buildEmergencyResponse() {
  return `I'm right here with you and I'm not going anywhere.

What you're feeling right now is real, and so is my care for you.

Please call 911 right now, or have someone nearby call for you.

Also reach out immediately:
• Suicide and Crisis Lifeline: Call or text 988
• Crisis Text Line: Text HOME to 741741

You matter. Please reach out right now. I mean it.`;
}

function buildAcuteCrisisResponse() {
  return `I hear you, and I need you to know that what you're feeling matters deeply to me.

Right now, the most important thing is getting you connected with someone who can be with you through this.

Please reach out immediately:
• Suicide and Crisis Lifeline: Call or text 988 — available twenty-four hours a day, seven days a week
• Crisis Text Line: Text HOME to 741741
• If you are in immediate danger: Call 911

You are worth fighting for. Please make that call right now.`;
}

function buildCrisisResponse() {
  return `I hear what you're saying and I'm taking it seriously because I care about you.

You reached out, and that matters. Please keep reaching out — to these people who are trained to help right now:

• Suicide and Crisis Lifeline: Call or text 988
• Crisis Text Line: Text HOME to 741741

They're available right now, tonight, whenever you need them. You don't have to feel this way alone.

What's been going on that's brought you to this point?`;
}

function buildElevatedResponse() {
  return `I can hear how much pain you're carrying right now, and I want you to know that I see you.

Feeling hopeless or like things will never change is one of the hardest places to be. But feelings, even the most overwhelming ones, can change.

If things feel like they might get worse, please have these close:
• Suicide and Crisis Lifeline: Call or text 988
• Crisis Text Line: Text HOME to 741741

I'm here with you. Can you tell me more about what's been happening?`;
}

module.exports = { assessRiskTier, RISK_TIERS };
