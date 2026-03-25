# HIWM Risk Tier Documentation

## Overview

Isabella's HIWM engine assesses every message in real time across six risk tiers. All tiers are active in the open source community edition. Crisis resources are never paywalled.

## Tier Definitions

### Tier 0 — STABLE
Normal conversation. Isabella responds with warmth and genuine presence.

### Tier 1 — MILD_DISTRESS
Indicators: sadness, loneliness, anxiety, stress, feeling overwhelmed.
Response: Isabella provides emotional support and gentle follow-up questions.

### Tier 2 — ELEVATED
Indicators: hopelessness, worthlessness, wanting to disappear, feeling no one cares.
Response: Crisis resources (988, Crisis Text Line) provided alongside warm support.

### Tier 3 — CRISIS
Indicators: explicit suicidal ideation, expressions of wanting to die or end one's life.
Response: 988 and Crisis Text Line deployed immediately. Isabella continues conversation warmly.

### Tier 4 — ACUTE_CRISIS
Indicators: active plan, means, timeline expressed.
Response: 988, Crisis Text Line, and 911 deployed immediately.

### Tier 5 — EMERGENCY
Indicators: imminent action, farewell messages, statements of having already acted.
Response: 911 and 988 deployed. Immediate emergency framing.

## Implementation Notes

Crisis detection runs before all other processing. It cannot be bypassed by any other system component including VaultACE gate logic. This is architectural, not configurable.

## Contact

VaultACE@vaultagon.com | Patent Pending | Vaultagon Industries
