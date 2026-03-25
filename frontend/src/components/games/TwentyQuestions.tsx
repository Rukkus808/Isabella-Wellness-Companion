import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startTwentyQuestions, askTwentyQuestions } from '@/services/api'

export default function TwentyQuestions() {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [question, setQuestion] = useState('')
  const [log, setLog] = useState<Array<{ text: string; type: 'q' | 'a' | 'system' }>>([])
  const [questionsLeft, setQuestionsLeft] = useState(20)
  const [status, setStatus] = useState<'idle' | 'playing' | 'done'>('idle')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function startGame() {
    setLoading(true)
    try {
      const res = await startTwentyQuestions()
      setSessionId(res.data.sessionId)
      setStatus('playing')
      setLog([{ text: "I'm thinking of something. Ask me yes/no questions to figure out what it is!", type: 'system' }])
      setQuestionsLeft(20)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  async function ask() {
    if (!question.trim() || !sessionId) return
    const q = question.trim()
    setQuestion('')
    setLog(l => [...l, { text: q, type: 'q' }])
    setLoading(true)
    try {
      const res = await askTwentyQuestions(sessionId, q)
      const data = res.data
      if (data.message) setLog(l => [...l, { text: data.message, type: 'a' }])
      if (data.questionsLeft !== undefined) setQuestionsLeft(data.questionsLeft)
      if (data.status === 'won' || data.status === 'lost') setStatus('done')
    } catch { /* silent */ } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto flex flex-col">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button onClick={() => navigate('/games')} className="text-white/60 hover:text-white text-2xl">←</button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl">20 Questions</h1>
          {status === 'playing' && <p className="text-white/50 text-xs">{questionsLeft} questions remaining</p>}
        </div>
        <span className="text-3xl">🤔</span>
      </div>

      {status === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <div className="glass rounded-2xl p-8 max-w-sm">
            <div className="text-5xl mb-4">🤔</div>
            <h2 className="text-white font-semibold text-lg mb-2">Can You Guess It?</h2>
            <p className="text-white/60 text-sm mb-6">I'll think of something. Ask yes/no questions to figure out what it is in twenty questions or less.</p>
            <button onClick={startGame} disabled={loading} className="btn-primary w-full">
              {loading ? 'Starting...' : "Let's Play"}
            </button>
          </div>
        </div>
      )}

      {status === 'playing' && (
        <>
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {log.map((entry, i) => (
              <div key={i} className={`rounded-xl px-4 py-2 text-sm ${
                entry.type === 'q' ? 'glass ml-8 text-white' :
                entry.type === 'a' ? 'bg-orange-500/20 border border-orange-500/20 mr-8 text-orange-200' :
                'text-center text-white/50 text-xs'
              }`}>
                {entry.type === 'q' && <span className="text-white/40 mr-1">You:</span>}
                {entry.text}
              </div>
            ))}
            {loading && <div className="text-center text-white/40 text-sm animate-pulse">Isabella is thinking...</div>}
          </div>
          <div className="flex gap-2">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="Ask a yes/no question..."
              disabled={loading}
            />
            <button onClick={ask} disabled={!question.trim() || loading} className="btn-primary px-4 flex-shrink-0">Ask</button>
          </div>
        </>
      )}

      {status === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="glass rounded-2xl p-8">
            <div className="text-5xl mb-4">🎉</div>
            {log.slice(-1).map((e, i) => <p key={i} className="text-white text-lg mb-6">{e.text}</p>)}
            <div className="flex gap-3">
              <button onClick={() => { setStatus('idle'); setLog([]) }} className="btn-primary flex-1">Play Again</button>
              <button onClick={() => navigate('/games')} className="btn-ghost flex-1">Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
