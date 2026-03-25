interface Props {
  onClose: () => void
}

export default function CrisisModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-red-900/90 to-red-800/90 border border-red-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💙</div>
          <h2 className="text-xl font-bold text-white">You're Not Alone</h2>
          <p className="text-red-200 text-sm mt-1">Help is available right now, 24 hours a day</p>
        </div>

        <div className="space-y-3 mb-6">
          <a
            href="tel:988"
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors"
          >
            <span className="text-2xl">📞</span>
            <div>
              <div className="text-white font-bold text-lg">Call or Text 988</div>
              <div className="text-red-200 text-xs">Suicide and Crisis Lifeline</div>
            </div>
          </a>

          <a
            href="sms:741741?body=HOME"
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <div>
              <div className="text-white font-bold">Text HOME to 741741</div>
              <div className="text-red-200 text-xs">Crisis Text Line</div>
            </div>
          </a>

          <a
            href="tel:911"
            className="flex items-center gap-3 bg-red-600/40 hover:bg-red-600/60 rounded-xl p-3 transition-colors"
          >
            <span className="text-2xl">🚨</span>
            <div>
              <div className="text-white font-bold">Call 911</div>
              <div className="text-red-200 text-xs">If you are in immediate danger</div>
            </div>
          </a>
        </div>

        <button onClick={onClose} className="btn-ghost w-full text-sm">
          Return to Isabella
        </button>
      </div>
    </div>
  )
}
