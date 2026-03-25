export interface User {
  id: number
  email: string
  subscriptionTier: 'free' | 'developer' | 'professional' | 'enterprise'
  intimacyLevel: number
  riskTierCurrent: number
}

export interface Message {
  id?: number
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
  riskLevel?: number
  emotionalValence?: number
}

export interface ChatMetadata {
  riskTier: number
  emotionalValence: number
  wellness: WellnessData
  vaultaceRequired: boolean
  messagesRemaining: number | null
}

export interface WellnessData {
  messageCount: number
  wellnessScore: number
  status: 'HEALTHY' | 'MONITORED' | 'FLAGGED'
  flags: string[]
}

export interface GameSession {
  sessionId: number
  status: string
  score?: number
}

export type RiskTier = 0 | 1 | 2 | 3 | 4 | 5

export const RISK_LABELS: Record<RiskTier, string> = {
  0: 'Stable',
  1: 'Mild Distress',
  2: 'Elevated',
  3: 'Crisis',
  4: 'Acute Crisis',
  5: 'Emergency'
}

export const RISK_COLORS: Record<RiskTier, string> = {
  0: 'text-green-400',
  1: 'text-yellow-300',
  2: 'text-orange-400',
  3: 'text-red-400',
  4: 'text-red-500',
  5: 'text-red-600'
}
