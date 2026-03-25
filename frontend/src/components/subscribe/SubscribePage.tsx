import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlans, createCheckout } from '@/services/api'

interface Plan {
  tier: string
  name: string
  price: string
  features: string[]
}

export default function SubscribePage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getPlans().then(res => setPlans(res.data.plans)).catch(() => {})
  }, [])

  async function subscribe(tier: string) {
    if (tier === 'free') return
    if (tier === 'enterprise') {
      window.location.href = 'mailto:VaultACE@vaultagon.com?subject=Enterprise Inquiry'
      return
    }
    setLoading(tier)
    try {
      const res = await createCheckout(tier)
      window.location.href = res.data.url
    } catch { /* silent */ } finally { setLoading(null) }
  }

  const TIER_STYLE: Record<string, string> = {
    free: 'border-white/10',
    developer: 'border-orange-500/50 ring-1 ring-orange-500/30',
    professional: 'border-violet-500/50 ring-1 ring-violet-500/30',
    enterprise: 'border-white/20'
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white text-2xl">←</button>
        <div>
          <h1 className="text-white font-bold text-xl">Upgrade Isabella</h1>
          <p className="text-white/50 text-xs">Unlock more of what she can do</p>
        </div>
      </div>

      <div className="grid gap-4">
        {plans.map(plan => (
          <div
            key={plan.tier}
            className={`glass rounded-2xl p-6 border ${TIER_STYLE[plan.tier] || 'border-white/10'} relative`}
          >
            {plan.tier === 'developer' && (
              <span className="absolute -top-2 left-6 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                Most Popular
              </span>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <p className="text-orange-400 font-semibold">{plan.price}</p>
              </div>
              {plan.tier !== 'free' && plan.tier !== 'enterprise' && (
                <button
                  onClick={() => subscribe(plan.tier)}
                  disabled={loading === plan.tier}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {loading === plan.tier ? 'Loading...' : 'Subscribe'}
                </button>
              )}
              {plan.tier === 'enterprise' && (
                <button onClick={() => subscribe(plan.tier)} className="btn-ghost text-sm px-4 py-2">
                  Contact Us
                </button>
              )}
            </div>
            <ul className="space-y-1.5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                  <span className="text-green-400 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-center text-white/30 text-xs mt-8">
        All payments via Stripe or PayPal · Crisis resources always free · vaultagon.com
      </p>
    </div>
  )
}
