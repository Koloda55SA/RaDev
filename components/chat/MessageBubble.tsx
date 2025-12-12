'use client'

import { useState } from 'react'
import { escapeHtml } from '@/lib/utils/security'
import { Code2, Check, CheckCheck } from 'lucide-react'

interface MessageBubbleProps {
  message: {
    id: string
    text: string
    senderId: string
    senderEmail: string
    timestamp: Date | string
    read?: boolean
    imageUrl?: string
    code?: string
    codeLanguage?: string
  }
  isUser: boolean
  senderAvatar?: string
  senderNickname?: string
  onAvatarClick?: () => void
}

export default function MessageBubble({
  message,
  isUser,
  senderAvatar,
  senderNickname,
  onAvatarClick,
}: MessageBubbleProps) {
  const [imageError, setImageError] = useState(false)
  const [expandedImage, setExpandedImage] = useState(false)

  const formatTime = (timestamp: Date | string) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {!isUser && (
        <button
          onClick={onAvatarClick}
          className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
        >
          <img
            src={senderAvatar || '/default-avatar.png'}
            alt={senderNickname || 'User'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </button>
      )}

      <div
        className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 break-words shadow-sm hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-secondary text-secondary-foreground rounded-bl-sm'
        }`}
      >
        {!isUser && senderNickname && (
          <p className="text-xs sm:text-sm font-semibold mb-1.5 opacity-90">
            {senderNickname}
          </p>
        )}

        {message.imageUrl && !imageError && (
          <div className="mb-2 relative group/image">
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="max-w-full max-h-[200px] sm:max-h-[300px] rounded-xl object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedImage(true)}
              onError={() => setImageError(true)}
            />
            {expandedImage && (
              <div
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                onClick={() => setExpandedImage(false)}
              >
                <img
                  src={message.imageUrl}
                  alt="Expanded"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {message.code && (
          <div className="mb-2 p-2.5 sm:p-3 bg-background/20 dark:bg-background/40 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Code2 className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
              <p className="text-xs opacity-70">
                {escapeHtml(message.codeLanguage || 'text')}
              </p>
            </div>
            <pre className="text-xs sm:text-sm whitespace-pre-wrap break-words">
              {escapeHtml(message.code)}
            </pre>
          </div>
        )}

        {message.text && (
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
            {escapeHtml(message.text)}
          </p>
        )}

        <div className="flex items-center justify-end gap-1.5 mt-2">
          <p className="text-[10px] sm:text-xs opacity-70">
            {formatTime(message.timestamp)}
          </p>
          {isUser && (
            <div className="opacity-70">
              {message.read ? (
                <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              ) : (
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <button
          onClick={onAvatarClick}
          className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
        >
          <img
            src={senderAvatar || '/default-avatar.png'}
            alt="You"
            className="w-full h-full object-cover"
          />
        </button>
      )}
    </div>
  )
}

