import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, getWellness } from '@/services/api'
import { useAuthStore } from '@/store'

interface Profile {
  email: string
  subscription_tier: string
  intimacy_level: number
  risk_tier_current: number
  emotional_valence: number
  created_at: string
}

interface Wellness {
  messageCount: number
  crisisInterventions: number
  todayMessages: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [wellness, setWellness] = useState<Wellness | null>(null)
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    getProfile().then(res => setProfile(res.data.profile)).catch(() => {})
    getWellness().then(res => setWellness(res.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white text-2xl">←</button>
        <h1 className="text-white font-bold text-xl">Your Profile</h1>
      </div>

      {profile && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center text-2xl">
                🌺
              </div>
              <div>
                <div className="text-white font-semibold">{profile.email}</div>
                <div className="text-orange-400 text-sm capitalize">{profile.subscription_tier} plan</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-xl">{wellness?.todayMessages ?? 0}</div>
                <div className="text-white/50 text-xs">Messages today</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-white font-bold text-xl">{wellness?.messageCount ?? 0}</div>
                <div className="text-white/50 text-xs">Total messages</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Wellness</h3>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">HIWM Status</span>
              <span className="text-green-400 text-sm font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/70 text-sm">Crisis Resources</span>
              <span className="text-orange-400 text-sm font-medium">Always Free</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button onClick={() => navigate('/subscribe')} className="btn-ghost w-full text-left flex items-center justify-between">
              <span>Upgrade Plan</span><span>→</span>
            </button>
            <button onClick={logout} className="w-full text-center text-white/40 hover:text-white/60 py-3 text-sm transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
