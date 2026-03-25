import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startTwoTruths, submitStatements, guessLie } from '@/services/api'

type Phase = 'idle' | 'user_submitting' | 'isabella_guessing' | 'user_guessing' | 'done'

export default function TwoTruths() {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [statements, setStatements] = useState(['', '', ''])
  const [lieIndex, setLieIndex] = useState<number | null>(null)
  const [isabellaStatements, setIsabellaStatements] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [userGuess, setUserGuess] = useState<number | null>(null)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function startGame() {
    setLoading(true)
    try {
      const res = await startTwoTruths()
      setSessionId(res.data.sessionId)
      setPhase('user_submitting')
      setMessage(res.data.message)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  async function submit() {
    if (!sessionId || lieIndex === null || statements.some(s => !s.trim())) return
    setLoading(true)
    try {
      const res = await submitStatements(sessionId, statements, lieIndex)
      const data = res.data
      setMessage(data.message)
      setIsabellaStatements(data.isabellaStatements || [])
      setPhase('user_guessing')
    } catch { /* silent */ } finally { setLoading(false) }
  }

  async function makeGuess(index: number) {
    if (!sessionId) return
    setUserGuess(index)
    setLoading(true)
    try {
      const res = await guessLie(sessionId, index)
      setResult(res.data.message)
      setPhase('done')
    } catch { /* silent */ } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto flex flex-col">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button onClick={() => navigate('/games')} className="text-white/60 hover:text-white text-2xl">←</button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl">Two Truths & a Lie</h1>
          <p className="text-white/50 text-xs">Can you fool Isabella?</p>
        </div>
        <span className="text-3xl">🕵️</span>
      </div>

      {phase === 'idle' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-sm">
            <div className="text-5xl mb-4">🕵️</div>
            <h2 className="text-white font-semibold text-lg mb-2">Two Truths & a Lie</h2>
            <p className="text-white/60 text-sm mb-6">Share three statements — two true, one lie. I'll try to guess which is the lie. Then I'll share mine!</p>
            <button onClick={startGame} disabled={loading} className="btn-primary w-full">{loading ? 'Starting...' : "Let's Play"}</button>
          </div>
        </div>
      )}

      {phase === 'user_submitting' && (
        <div className="flex-1 space-y-4">
          <p className="text-white/70 text-sm">{message}</p>
          <p className="text-white/50 text-xs">Write three statements, then tap which one is the lie.</p>
          {statements.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm w-20">Statement {i + 1}</span>
                <button
                  onClick={() => setLieIndex(i)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-all ${lieIndex === i ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
                >
                  {lieIndex === i ? '🤥 This is the lie' : 'Mark as lie'}
                </button>
              </div>
              <input
                value={s}
                onChange={e => { const n = [...statements]; n[i] = e.target.value; setStatements(n) }}
                placeholder={`Statement ${i + 1}...`}
              />
            </div>
          ))}
          <button
            onClick={submit}
            disabled={loading || lieIndex === null || statements.some(s => !s.trim())}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Submitting...' : 'Submit — Let Isabella Guess'}
          </button>
        </div>
      )}

      {phase === 'user_guessing' && (
        <div className="flex-1 space-y-4">
          <div className="glass rounded-xl p-4">
            <p className="text-white text-sm">{message}</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/70 text-sm font-medium">Now guess which of my statements is the lie:</p>
            {isabellaStatements.map((s, i) => (
              <button
                key={i}
                onClick={() => makeGuess(i)}
                disabled={loading || userGuess !== null}
                className="glass w-full rounded-xl p-4 text-left text-white/90 text-sm hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <span className="text-white/40 mr-2">{i + 1}.</span> {s}
              </button>
            ))}
          </div>
          {loading && <div className="text-center text-white/40 text-sm animate-pulse">Checking...</div>}
        </div>
      )}

      {phase === 'done' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎭</div>
            <p className="text-white text-lg mb-6">{result}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase('idle'); setStatements(['','','']); setLieIndex(null); setUserGuess(null); setResult('') }}
                className="btn-primary flex-1"
              >
                Play Again
              </button>
              <button onClick={() => navigate('/games')} className="btn-ghost flex-1">Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
