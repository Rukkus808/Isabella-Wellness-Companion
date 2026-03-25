import { useNavigate } from 'react-router-dom'

const GAMES = [
  { path: '/games/twenty-questions', emoji: '🤔', title: '20 Questions', desc: 'Think of something — I\'ll guess it in twenty questions or less.' },
  { path: '/games/word-association', emoji: '💭', title: 'Word Association', desc: 'Twenty rounds of rapid-fire word chains. Don\'t repeat a word!' },
  { path: '/games/two-truths', emoji: '🕵️', title: 'Two Truths & a Lie', desc: 'Can you fool me? Can I fool you? Let\'s find out.' },
]

export default function GameMenu() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white text-2xl">←</button>
        <div>
          <h1 className="text-white font-bold text-xl">Games</h1>
          <p className="text-white/50 text-xs">Play with Isabella</p>
        </div>
      </div>

      <div className="space-y-3">
        {GAMES.map(game => (
          <button
            key={game.path}
            onClick={() => navigate(game.path)}
            className="glass w-full rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">{game.emoji}</span>
              <div>
                <div className="text-white font-semibold">{game.title}</div>
                <div className="text-white/50 text-sm mt-0.5">{game.desc}</div>
              </div>
              <span className="ml-auto text-white/30 group-hover:text-white/60">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
