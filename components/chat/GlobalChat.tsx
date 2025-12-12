'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth/useAuth'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Image as ImageIcon, Code } from 'lucide-react'
import toast from 'react-hot-toast'
import { escapeHtml, sanitizeString } from '@/lib/utils/security'
import { filterProfanity } from '@/lib/utils/profanityFilter'
import MessageBubble from '@/components/chat/MessageBubble'

interface GlobalMessage {
  id: string
  content: string
  senderId: string
  senderEmail: string
  senderNickname?: string
  senderAvatar?: string
  timestamp: Date | string
  fileUrl?: string
  code?: string
  codeLanguage?: string
}

interface GlobalChatProps {
  user: any
  userRole?: 'admin' | 'user' | null
}

export default function GlobalChat({ user, userRole }: GlobalChatProps) {
  const [messages, setMessages] = useState<GlobalMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadMessages()
      // Polling для обновления сообщений каждые 3 секунды
      const intervalId = setInterval(loadMessages, 3000)
      return () => clearInterval(intervalId)
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    if (!user) return

    try {
      const response = await apiClient.getGlobalChat(50)
      if (response.success && response.data) {
        const messagesData = response.data.map((msg: any) => ({
          id: msg.id || msg.messageId,
          content: msg.content || msg.text || '',
          senderId: msg.senderId || msg.sender?.id,
          senderEmail: msg.senderEmail || msg.sender?.email || '',
          senderNickname: msg.senderNickname || msg.sender?.nickname || 'Пользователь',
          senderAvatar: msg.senderAvatar || msg.sender?.avatar,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          fileUrl: msg.fileUrl || msg.imageUrl,
          code: msg.code,
          codeLanguage: msg.codeLanguage,
        })) as GlobalMessage[]
        setMessages(messagesData)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading global messages:', error)
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return

    const messageText = input.trim()
    setInput('')
    setSending(true)

    try {
      // Санитизируем и фильтруем маты
      const sanitizedText = sanitizeString(messageText)
      const filteredText = filterProfanity(sanitizedText)

      const response = await apiClient.sendGlobalMessage(filteredText)

      if (response.success) {
        // Обновляем сообщения
        await loadMessages()
        toast.success('Сообщение отправлено')
      } else {
        throw new Error(response.error || 'Ошибка отправки')
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Ошибка отправки сообщения')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Загрузка сообщений...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] sm:h-[650px] max-h-[700px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 animate-in fade-in duration-300">
            <p className="text-base sm:text-lg">Пока нет сообщений. Будьте первым! 👋</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const userId = ('uid' in user ? user.uid : user.id) || ''
              const isUser = message.senderId === userId

              return (
                <MessageBubble
                  key={message.id}
                  message={{
                    ...message,
                    text: message.content,
                  }}
                  isUser={isUser}
                  senderAvatar={isUser ? (user.photoURL || '/default-avatar.png') : (message.senderAvatar || '/default-avatar.png')}
                  senderNickname={isUser ? undefined : message.senderNickname}
                  onAvatarClick={() => {
                    if (!isUser && message.senderId) {
                      window.location.href = `/users/${message.senderId}`
                    }
                  }}
                />
              )
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Введите сообщение..."
            disabled={sending}
            className="min-h-[60px] max-h-[120px] resize-none flex-1"
            rows={2}
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={!input.trim() || sending}
            className="self-end flex-shrink-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

