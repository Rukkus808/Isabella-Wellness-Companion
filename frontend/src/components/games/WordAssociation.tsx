import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startWordAssociation, respondWordAssociation } from '@/services/api'

export default function WordAssociation() {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [currentWord, setCurrentWord] = useState('')
  const [word, setWord] = useState('')
  const [log, setLog] = useState<Array<{ word: string; by: 'you' | 'isabella' }>>([])
  const [round, setRound] = useState(0)
  const [status, setStatus] = useState<'idle' | 'playing' | 'done'>('idle')
  const [endMessage, setEndMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function startGame() {
    setLoading(true)
    try {
      const res = await startWordAssociation()
      setSessionId(res.data.sessionId)
      setCurrentWord(res.data.starterWord)
      setLog([{ word: res.data.starterWord, by: 'isabella' }])
      setRound(1)
      setStatus('playing')
    } catch { /* silent */ } finally { setLoading(false) }
  }

  async function respond() {
    if (!word.trim() || !sessionId) return
    const w = word.trim().toLowerCase()
    setWord('')
    setLog(l => [...l, { word: w, by: 'you' }])
    setLoading(true)
    try {
      const res = await respondWordAssociation(sessionId, w)
      const data = res.data
      if (data.isabellaWord) setLog(l => [...l, { word: data.isabellaWord, by: 'isabella' }])
      if (data.round) setRound(data.round)
      setCurrentWord(data.currentWord || w)
      if (data.status !== 'active') {
        setEndMessage(data.message || 'Game over!')
        setStatus('done')
      }
    } catch { /* silent */ } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto flex flex-col">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button onClick={() => navigate('/games')} className="text-white/60 hover:text-white text-2xl">←</button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl">Word Association</h1>
          {status === 'playing' && <p className="text-white/50 text-xs">Round {round} of 20</p>}
        </div>
        <span className="text-3xl">💭</span>
      </div>

      {status === 'idle' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-sm">
            <div className="text-5xl mb-4">💭</div>
            <h2 className="text-white font-semibold text-lg mb-2">Word Association</h2>
            <p className="text-white/60 text-sm mb-6">I'll say a word, you say the first word that comes to mind. Keep the chain going for twenty rounds — no repeats!</p>
            <button onClick={startGame} disabled={loading} className="btn-primary w-full">{loading ? 'Starting...' : "Let's Play"}</button>
          </div>
        </div>
      )}

      {status === 'playing' && (
        <>
          <div className="flex-1 flex flex-col justify-end space-y-2 mb-4 overflow-y-auto">
            {log.slice(-8).map((entry, i) => (
              <div key={i} className={`flex ${entry.by === 'you' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-2 text-base font-medium ${
                  entry.by === 'you'
                    ? 'bg-orange-500/80 text-white'
                    : 'glass text-white/90'
                }`}>
                  {entry.word}
                </div>
              </div>
            ))}
            <div className="text-center py-2">
              <div className="text-white/30 text-xs">Your turn — respond to:</div>
              <div className="text-white text-2xl font-bold mt-1">{currentWord}</div>
            </div>
            {loading && <div className="text-center text-white/40 text-sm animate-pulse">Isabella is thinking...</div>}
          </div>
          <div className="flex gap-2">
            <input
              value={word}
              onChange={e => setWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && respond()}
              placeholder="Your word..."
              disabled={loading}
              autoFocus
            />
            <button onClick={respond} disabled={!word.trim() || loading} className="btn-primary px-4 flex-shrink-0">→</button>
          </div>
        </>
      )}

      {status === 'done' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-white text-lg mb-6">{endMessage}</p>
            <div className="flex gap-3">
              <button onClick={() => { setStatus('idle'); setLog([]); setRound(0) }} className="btn-primary flex-1">Play Again</button>
              <button onClick={() => navigate('/games')} className="btn-ghost flex-1">Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
