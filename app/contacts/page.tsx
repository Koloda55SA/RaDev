'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, MessageCircle, Github, Send, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDb } from '@/lib/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { motion } from 'framer-motion'

interface FormErrors {
  name?: string
  email?: string
  message?: string
  telegram?: string
}

function ContactsForm() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    telegram: '',
    budget: '',
    deadline: '',
    honeypot: '', // Защита от спама
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const lastSubmitTime = useRef<number>(0)

  useEffect(() => {
    // Предзаполнение формы из калькулятора
    const type = searchParams.get('type')
    const estimatedPrice = searchParams.get('estimatedPrice')
    
    if (type && estimatedPrice) {
      const typeNames: { [key: string]: string } = {
        diploma: 'Дипломная работа',
        website: 'Веб-сайт',
        mobile: 'Мобильное приложение',
        desktop: 'Десктоп приложение',
        other: 'Другое',
      }
      
      setFormData(prev => ({
        ...prev,
        message: `Здравствуйте! Я заинтересован в разработке: ${typeNames[type] || type}\n\nПримерная стоимость: ${estimatedPrice} сом\n\nПожалуйста, свяжитесь со мной для обсуждения деталей.`,
      }))
    }
  }, [searchParams])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Некорректный email'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Сообщение обязательно'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Сообщение должно содержать минимум 10 символов'
    }

    if (formData.telegram && !formData.telegram.startsWith('@')) {
      newErrors.telegram = 'Telegram должен начинаться с @'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Защита от спама: honeypot
    if (formData.honeypot) {
      toast.error('Обнаружена подозрительная активность')
      return
    }

    // Rate limiting: максимум 3 отправки в минуту
    const now = Date.now()
    if (now - lastSubmitTime.current < 60000) {
      if (submitCount >= 3) {
        toast.error('Слишком много запросов. Подождите минуту.')
        return
      }
    } else {
      setSubmitCount(0)
    }

    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме')
      return
    }

    setIsSubmitting(true)
    lastSubmitTime.current = now
    setSubmitCount(prev => prev + 1)

    try {
      let telegramLink = ''
      if (formData.telegram) {
        const telegramUsername = formData.telegram.replace('@', '')
        telegramLink = `https://t.me/${telegramUsername}`
      }

      await addDoc(collection(getDb(), 'project_requests'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        telegram: formData.telegram || '',
        telegramLink: telegramLink,
        budget: formData.budget || '',
        deadline: formData.deadline || '',
        createdAt: serverTimestamp(),
        status: 'new',
        acceptedBy: null,
        acceptedAt: null,
        ipAddress: null, // Можно добавить через API route
      })
      
      toast.success('✅ Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
      setFormData({ name: '', email: '', message: '', telegram: '', budget: '', deadline: '', honeypot: '' })
      setErrors({})
    } catch (error: any) {
      console.error('Error submitting form:', error)
      toast.error(`Ошибка отправки заявки: ${error.message || 'Неизвестная ошибка'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Валидация в реальном времени (19)
    const newErrors: FormErrors = { ...errors }
    
    if (field === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Имя обязательно'
      } else if (value.trim().length < 2) {
        newErrors.name = 'Имя должно содержать минимум 2 символа'
      } else {
        delete newErrors.name
      }
    }
    
    if (field === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email обязателен'
      } else if (!validateEmail(value)) {
        newErrors.email = 'Некорректный email'
      } else {
        delete newErrors.email
      }
    }
    
    if (field === 'message') {
      if (!value.trim()) {
        newErrors.message = 'Сообщение обязательно'
      } else if (value.trim().length < 10) {
        newErrors.message = 'Сообщение должно содержать минимум 10 символов'
      } else {
        delete newErrors.message
      }
    }
    
    if (field === 'telegram' && value) {
      if (!value.startsWith('@')) {
        newErrors.telegram = 'Telegram должен начинаться с @'
      } else {
        delete newErrors.telegram
      }
    }
    
    setErrors(newErrors)
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 px-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-blue">
          {t('contacts.title')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          {t('contacts.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('contacts.form.name')}</CardTitle>
              <CardDescription>
                Заполните форму, и мы свяжемся с вами в ближайшее время
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot поле (скрытое) */}
                <div style={{ position: 'absolute', left: '-9999px' }}>
                  <Label htmlFor="honeypot">Не заполняйте это поле</Label>
                  <Input
                    id="honeypot"
                    type="text"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="name">{t('contacts.form.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">{t('contacts.form.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telegram">Telegram (необязательно)</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => handleChange('telegram', e.target.value)}
                    placeholder="@username"
                    className={errors.telegram ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.telegram && (
                    <p className="text-sm text-red-500 mt-1">{errors.telegram}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message">{t('contacts.form.message')} *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={6}
                    className={errors.message ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Минимум 10 символов. Осталось: {Math.max(0, 10 - formData.message.trim().length)}
                  </p>
                </div>

                {/* Улучшенная форма (75) - дополнительные поля */}
                <div>
                  <Label htmlFor="budget">Бюджет (необязательно)</Label>
                  <Input
                    id="budget"
                    type="text"
                    placeholder="Например: 50000 сом"
                    value={formData.budget || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Желаемый срок (необязательно)</Label>
                  <Input
                    id="deadline"
                    type="text"
                    placeholder="Например: 2 недели"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="neon"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Отправка...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('contacts.form.send')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('contacts.social')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <a
                  href="mailto:kalikoloda66@gmail.com"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">kalikoloda66@gmail.com</p>
                  </div>
                </a>

                <a
                  href="https://t.me/radev_team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">@radev_team</p>
                  </div>
                </a>

                <a
                  href="https://github.com/Koloda55SA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">github.com/Koloda55SA</p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-sm text-muted-foreground">@radev.digital</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20"><p className="text-center">Загрузка...</p></div>}>
      <ContactsForm />
    </Suspense>
  )
}
