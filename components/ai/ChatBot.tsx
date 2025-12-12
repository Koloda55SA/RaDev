'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Send, Bot, X, Lock } from 'lucide-react'
// Firebase используется только для аутентификации, данные через C# API
import { useAuth } from '@/components/auth/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

import { SYSTEM_PROMPT } from '@/lib/ai/prompt'

const RESPONSES: Record<string, string> = {
  'услуги': 'Мы предлагаем: веб-разработку (сайты, магазины), мобильные приложения (Android, iOS), десктопные приложения, дипломные работы. Сыймыкбек (главный разработчик) специализируется на Fullstack разработке, а Абдыкадыр (ученик, 4 курс) — на мобильных и десктопных приложениях.',
  'стоимость': 'Дипломная работа: от 2000 сом. Веб-сайт/магазин: от 15000 сом (с доп. пожеланиями 20000 сом). Android приложение: 30000 сом. iOS приложение: 30000 сом. Для других проектов разработчики оценят работу индивидуально.',
  'цены': 'Дипломная работа: от 2000 сом (полная работа на Word, 50 вопросов/ответов, объяснение как сдавать). Веб-сайт/магазин: от 15000 сом (20000 с доп. пожеланиями). Android/iOS приложение: 30000 сом под ключ.',
  'диплом': 'Дипломная работа стоит от 2000 сом. Включает: полную дипломную работу на Word, 50 вопросов и 50 ответов по теме, полное объяснение как сдавать. Цена зависит от уровня сложности. Напишите в Telegram @Murka_ahh для уточнения.',
  'технологии': 'Мы работаем с React, Next.js, Node.js, Python, React Native, Flutter, TypeScript, Firebase и многими другими современными технологиями.',
  'команда': 'Команда R&A-Dev: Сыймыкбек (главный разработчик, 2 года опыта, 20+ проектов, @Murka_ahh) и Абдыкадыр (ученик, 4 курс, учится под руководством Сыймыкбека, @Badboy05y).',
  'проекты': 'Наши проекты: 1) KimeCosmicMall (https://kimecosmicmall.vercel.app/) - магазин одежды, 2) GameGift.live (https://gamegift.live/) - платформа для подарков в играх с Android приложением, 3) Dreamon (https://website-theta-one-41.vercel.app/) - AI примерочная (в разработке).',
  'контакты': 'Свяжитесь с нами: Сыймыкбек - @Murka_ahh, Абдыкадыр - @Badboy05y. Email: team@radev.digital. Мы всегда готовы обсудить ваш проект!',
  'сыймыкбек': 'Сыймыкбек Рахманов - главный разработчик команды R&A-Dev. Опыт: 2 года, 20+ завершенных проектов. Специализация: Fullstack разработка. Telegram: @Murka_ahh. Исправляет ошибки и наставляет Абдыкадыра.',
  'абдыкадыр': 'Абдыкадыр Абдырахманов - ученик Сыймыкбека, учится на 4 курсе. Развивается под руководством главного разработчика. Специализация: Mobile & Desktop Apps. Telegram: @Badboy05y.',
}

export default function ChatBot() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: user 
          ? 'Привет! Я виртуальный помощник R&A-Dev. Чем могу помочь?'
          : 'Для использования ИИ-ассистента необходимо войти в систему.',
        isUser: false,
        timestamp: new Date(),
      },
    ])
  }, [user])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    for (const [key, response] of Object.entries(RESPONSES)) {
      if (lowerMessage.includes(key)) {
        return response
      }
    }

    // Default responses
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
      return 'Привет! Я помощник команды R&A-Dev. Задайте вопрос о наших услугах, проектах, ценах или команде. Могу рассказать про дипломные работы, сайты, приложения!'
    }

    if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
      return 'Я могу ответить на вопросы о:\n• Наших услугах (дипломы, сайты, приложения)\n• Ценах\n• Проектах команды\n• Разработчиках (Сыймыкбек и Абдыкадыр)\n• Контактах\n\nЧто вас интересует?'
    }

    // Если не нашли ответ, направляем в Telegram
    return 'Спасибо за вопрос! Для получения более подробной информации свяжитесь с нами:\n• Сыймыкбек: @Murka_ahh\n• Абдыкадыр: @Badboy05y\n\nМы всегда готовы обсудить ваш проект!'
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    if (!user) {
      toast.error('Войдите в систему для использования ИИ-ассистента')
      router.push('/login')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // Формируем историю разговора (последние 10 сообщений)
      const conversationHistory = messages
        .slice(-10)
        .map((msg) => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        }))

      // Вызываем наш API route (ключ остается на сервере!)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: conversationHistory,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error:', errorData)
        
        // Если API ключ не настроен или другая ошибка сервера, используем fallback
        if (response.status === 500 || response.status === 401) {
          throw new Error('API_NOT_CONFIGURED')
        }
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      const aiResponse = data.message || generateResponse(currentInput)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

      // История AI чата больше не сохраняется (можно добавить через C# API если нужно)
    } catch (error: any) {
      console.error('Chat error:', error)
      // Fallback to local responses
      const fallbackResponse = generateResponse(currentInput)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      
      // Показываем более информативное сообщение
      if (error?.message === 'API_NOT_CONFIGURED') {
        toast.error('ИИ-ассистент временно недоступен. Используется локальный ответ.', {
          duration: 3000,
        })
      } else {
        toast.error('Ошибка соединения. Используется локальный ответ.', {
          duration: 3000,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 rounded-full h-12 w-12 md:h-14 md:w-14 shadow-lg glow-blue z-[90] md:z-[90]"
        onClick={() => {
          if (!user) {
            toast.error('Войдите в систему для использования ИИ-ассистента')
            router.push('/login')
            return
          }
          setIsOpen(true)
        }}
        title={user ? 'Открыть ИИ-ассистент' : 'Войдите для доступа к ИИ-ассистенту'}
      >
        {user ? <Bot className="h-5 w-5 md:h-6 md:w-6" /> : <Lock className="h-5 w-5 md:h-6 md:w-6" />}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-w-md h-[calc(100vh-11rem)] md:h-[500px] max-h-[calc(100vh-11rem)] md:max-h-[600px] flex flex-col shadow-2xl z-[90] md:z-[90] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          R&A-Dev AI
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 overscroll-contain" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 break-words ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-border">
          {user ? (
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
                disabled={loading}
                className="min-h-[60px] max-h-[120px] resize-none break-words overflow-wrap-anywhere word-break-break-word"
                rows={2}
                style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
              />
              <Button onClick={handleSend} size="icon" disabled={loading} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Войдите для использования ИИ-ассистента</p>
              <Button onClick={() => router.push('/login')} size="sm" className="w-full">
                Войти
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

