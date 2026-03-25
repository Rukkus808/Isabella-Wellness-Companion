import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendMessage, getChatHistory } from '@/services/api'
import { useAuthStore, useChatStore } from '@/store'
import { RISK_LABELS, RISK_COLORS, RiskTier } from '@/types'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import CrisisModal from './CrisisModal'
import { clsx } from 'clsx'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [showCrisis, setShowCrisis] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const {
    messages, isLoading, riskTier, messagesRemaining,
    addMessage, setMessages, setLoading, setRiskTier,
    setWellness, setMessagesRemaining
  } = useChatStore()

  useEffect(() => {
    getChatHistory()
      .then(res => setMessages(res.data.messages || []))
      .catch(() => {})
  }, [setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (riskTier >= 3) setShowCrisis(true)
  }, [riskTier])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')

    const userMsg = { role: 'user' as const, content: text }
    addMessage(userMsg)
    setLoading(true)

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const res = await sendMessage(text, history)
      const { response, metadata } = res.data

      addMessage({ role: 'assistant', content: response })
      setRiskTier(metadata.riskTier)
      if (metadata.wellness) setWellness(metadata.wellness)
      if (metadata.messagesRemaining !== undefined) setMessagesRemaining(metadata.messagesRemaining)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 429) {
        addMessage({ role: 'assistant', content: "You've reached your daily limit of twenty-five messages. Please come back tomorrow, or upgrade for unlimited conversations." })
      } else {
        addMessage({ role: 'assistant', content: "I'm here. Something went wrong on my end — please try again." })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const tier = riskTier as RiskTier

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="glass-dark px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center">
            🌺
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Isabella</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/50 text-xs">HIWM Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {riskTier > 0 && (
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full bg-white/10', RISK_COLORS[tier])}>
              {RISK_LABELS[tier]}
            </span>
          )}
          <button
            onClick={() => navigate('/games')}
            className="text-white/60 hover:text-white transition-colors text-xl"
            title="Games"
          >
            🎮
          </button>
          <button
            onClick={() => navigate('/subscribe')}
            className="text-white/60 hover:text-white transition-colors text-xl"
            title="Subscribe"
          >
            ⭐
          </button>
          <button
            onClick={logout}
            className="text-white/40 hover:text-white/70 transition-colors text-xs"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🌺</div>
            <h2 className="text-white/80 text-xl font-semibold mb-2">Hi, I'm Isabella</h2>
            <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
              I'm here to listen, support, and care for you. Whatever's on your mind — I'm ready.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Messages remaining notice */}
      {messagesRemaining !== null && messagesRemaining <= 5 && (
        <div className="px-4 py-2 text-center">
          <span className="text-orange-400/80 text-xs">
            {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} remaining today —{' '}
            <button onClick={() => navigate('/subscribe')} className="underline">upgrade</button> for unlimited
          </span>
        </div>
      )}

      {/* Input */}
      <div className="glass-dark px-4 py-3 sticky bottom-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to Isabella..."
            rows={1}
            className="flex-1 resize-none min-h-[44px] max-h-[120px] py-2.5"
            style={{ height: 'auto' }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4 py-2.5 flex-shrink-0 rounded-xl"
          >
            Send
          </button>
        </div>
        {riskTier >= 2 && (
          <button
            onClick={() => setShowCrisis(true)}
            className="w-full mt-2 text-xs text-red-400/80 hover:text-red-300 transition-colors py-1"
          >
            🆘 Crisis Resources — 988 · Crisis Text Line · 911
          </button>
        )}
      </div>

      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}
    </div>
  )
}
