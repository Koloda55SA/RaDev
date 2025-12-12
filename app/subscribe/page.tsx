'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDb } from '@/lib/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { motion } from 'framer-motion'

export default function SubscribePage() {
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
      await addDoc(collection(getDb(), 'email_subscriptions'), {
        email: email.trim(),
        subscribedAt: serverTimestamp(),
        active: true,
      })

      setSubscribed(true)
      setEmail('')
      toast.success('✅ Вы успешно подписались на рассылку!')
    } catch (error: any) {
      console.error('Error subscribing:', error)
      toast.error(`Ошибка подписки: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-blue">
          Подписка на новости
        </h1>
        <p className="text-lg text-muted-foreground">
          Получайте уведомления о новых проектах, статьях и акциях
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Email подписка</CardTitle>
          <CardDescription>
            Будьте в курсе всех новостей R&A-Dev
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscribed ? (
            <div className="text-center py-8">
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Спасибо за подписку!</h3>
              <p className="text-muted-foreground mb-4">
                Вы будете получать уведомления о новых проектах и статьях
              </p>
              <Button onClick={() => setSubscribed(false)} variant="outline">
                Подписаться еще раз
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email адрес</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Подписка...' : 'Подписаться'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Мы не будем спамить. Вы можете отписаться в любой момент.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


