import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('isabella_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('isabella_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password })

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const getMe = () => api.get('/auth/me')

// Chat
export const sendMessage = (message: string, conversationHistory: Array<{role: string, content: string}>) =>
  api.post('/chat', { message, conversationHistory })

export const getChatHistory = () => api.get('/chat/history')

// Games
export const startTwentyQuestions = () => api.post('/games/twenty-questions/start')
export const askTwentyQuestions = (sessionId: number, question: string) =>
  api.post('/games/twenty-questions/ask', { sessionId, question })

export const startWordAssociation = () => api.post('/games/word-association/start')
export const respondWordAssociation = (sessionId: number, word: string) =>
  api.post('/games/word-association/respond', { sessionId, word })

export const startTwoTruths = () => api.post('/games/two-truths/start')
export const submitStatements = (sessionId: number, statements: string[], lieIndex: number) =>
  api.post('/games/two-truths/submit-statements', { sessionId, statements, lieIndex })
export const guessLie = (sessionId: number, guessIndex: number) =>
  api.post('/games/two-truths/guess', { sessionId, guessIndex })

// Payments
export const getPlans = () => api.get('/payments/plans')
export const createCheckout = (tier: string) => api.post('/payments/stripe/checkout', { tier })

// Users
export const getProfile = () => api.get('/users/profile')
export const getWellness = () => api.get('/users/wellness')

export default api
