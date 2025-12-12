'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api/client'

export default function EmailSubscribe() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Введите email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Некорректный email')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiClient.subscribeEmail(email.trim())
      if (response.success) {
        setSubscribed(true)
        setEmail('')
        toast.success('✅ Вы успешно подписались!')
      } else {
        throw new Error(response.error || 'Ошибка подписки')
      }
    } catch (error: any) {
      console.error('Error subscribing:', error)
      toast.error(`Ошибка подписки: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <Check className="h-5 w-5" />
        <span className="text-sm">Подписка оформлена!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ваш email"
          className="pl-10"
          disabled={isSubmitting}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? '...' : 'Подписаться'}
      </Button>
    </form>
  )
}

