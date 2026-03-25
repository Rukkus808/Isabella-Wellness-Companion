import { create } from 'zustand'
import { Message, User, WellnessData } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

interface ChatStore {
  messages: Message[]
  isLoading: boolean
  riskTier: number
  wellness: WellnessData | null
  messagesRemaining: number | null
  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void
  setLoading: (v: boolean) => void
  setRiskTier: (tier: number) => void
  setWellness: (w: WellnessData) => void
  setMessagesRemaining: (n: number | null) => void
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  token: localStorage.getItem('isabella_token'),
  setUser: user => set({ user }),
  setToken: token => {
    if (token) localStorage.setItem('isabella_token', token)
    else localStorage.removeItem('isabella_token')
    set({ token })
  },
  logout: () => {
    localStorage.removeItem('isabella_token')
    set({ user: null, token: null })
  }
}))

export const useChatStore = create<ChatStore>(set => ({
  messages: [],
  isLoading: false,
  riskTier: 0,
  wellness: null,
  messagesRemaining: null,
  addMessage: msg => set(s => ({ messages: [...s.messages, msg] })),
  setMessages: messages => set({ messages }),
  setLoading: isLoading => set({ isLoading }),
  setRiskTier: riskTier => set({ riskTier }),
  setWellness: wellness => set({ wellness }),
  setMessagesRemaining: messagesRemaining => set({ messagesRemaining })
}))
