import { Message } from '@/types'
import { clsx } from 'clsx'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3 animate-slide-up', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">
          🌺
        </div>
      )}
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-gradient-to-br from-orange-500/80 to-orange-600/80 text-white rounded-br-sm'
            : 'glass text-white/90 rounded-bl-sm'
        )}
      >
        {message.content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-xs flex-shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  )
}
