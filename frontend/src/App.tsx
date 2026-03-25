import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import LoginPage from '@/components/auth/LoginPage'
import RegisterPage from '@/components/auth/RegisterPage'
import ChatPage from '@/components/chat/ChatPage'
import GameMenu from '@/components/games/GameMenu'
import TwentyQuestions from '@/components/games/TwentyQuestions'
import WordAssociation from '@/components/games/WordAssociation'
import TwoTruths from '@/components/games/TwoTruths'
import SubscribePage from '@/components/subscribe/SubscribePage'
import ProfilePage from '@/components/profile/ProfilePage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/games" element={<PrivateRoute><GameMenu /></PrivateRoute>} />
      <Route path="/games/twenty-questions" element={<PrivateRoute><TwentyQuestions /></PrivateRoute>} />
      <Route path="/games/word-association" element={<PrivateRoute><WordAssociation /></PrivateRoute>} />
      <Route path="/games/two-truths" element={<PrivateRoute><TwoTruths /></PrivateRoute>} />
      <Route path="/subscribe" element={<PrivateRoute><SubscribePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
