'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Редирект если пользователь авторизован
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[LoginPage] User authenticated, redirecting to home immediately')
      window.location.replace('/')
    }
  }, [user, authLoading])

  // КРИТИЧНО: Дополнительная проверка для мобильных после редиректа
  // Проверяем auth.currentUser напрямую, если loading закончился, но user еще null
  useEffect(() => {
    if (!authLoading && !user && typeof window !== 'undefined') {
      console.log('[LoginPage] Loading finished but no user, checking auth.currentUser...')
      
      // Проверяем URL на наличие OAuth параметров
      const urlParams = new URLSearchParams(window.location.search)
      const hasOAuthParams = urlParams.has('__firebase_request_key') || window.location.hash.includes('access_token')
      
      if (hasOAuthParams) {
        console.log('[LoginPage] OAuth params detected, will check auth.currentUser repeatedly')
      }
      
      let checkCount = 0
      const maxChecks = 30 // Проверяем 30 раз (6 секунд)
      let intervalId: NodeJS.Timeout | null = null
      
      const checkAuth = async () => {
        checkCount++
        try {
          const { auth } = await import('@/lib/firebase/config')
          if (!auth) return false
          console.log('[LoginPage] Check', checkCount, '- auth.currentUser:', auth.currentUser ? auth.currentUser.email : 'null')
          
          if (auth.currentUser) {
            console.log('[LoginPage] ✅ Found currentUser on check', checkCount, ':', auth.currentUser.email)
            if (intervalId) clearInterval(intervalId)
            window.location.replace('/')
            return true
          }
        } catch (err) {
          console.error('[LoginPage] Error checking auth:', err)
        }
        return false
      }
      
      // Проверяем сразу
      checkAuth().then(found => {
        if (!found) {
          // Если не нашли, проверяем каждые 200ms
          intervalId = setInterval(() => {
            if (checkCount >= maxChecks) {
              if (intervalId) clearInterval(intervalId)
              console.log('[LoginPage] ❌ Stopped checking after', checkCount, 'attempts - user not found')
              return
            }
            checkAuth().then(found => {
              if (found && intervalId) {
                clearInterval(intervalId)
              }
            })
          }, 200)
          
          // Останавливаем через 6 секунд
          setTimeout(() => {
            if (intervalId) {
              clearInterval(intervalId)
              console.log('[LoginPage] ⏱️ Timeout: Stopped checking auth.currentUser after', checkCount, 'attempts')
            }
          }, 6000)
        }
      })
      
      return () => {
        if (intervalId) clearInterval(intervalId)
      }
    }
  }, [authLoading, user])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('Пароли не совпадают')
          setLoading(false)
          return
        }
        await signUpWithEmail(email, password)
        toast.success('Аккаунт создан!')
      } else {
        await signInWithEmail(email, password)
        toast.success('Вход выполнен!')
      }
      // Редирект произойдет в useEffect
    } catch (error: any) {
      console.error('Auth error:', error)
      toast.error(error.message || 'Ошибка аутентификации')
      setLoading(false)
    }
  }

  const handleSocialAuth = async (provider: () => Promise<void>) => {
    setLoading(true)
    try {
      await provider()
      // Для redirect методов редирект произойдет сам, страница перезагрузится
      // Для popup методов сработает useEffect
      // Не сбрасываем loading для redirect, так как страница перезагрузится
      setTimeout(() => setLoading(false), 2000)
    } catch (error: any) {
      console.error('Social auth error:', error)
      let errorMessage = 'Ошибка входа через соцсеть'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Вход отменен'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Всплывающее окно заблокировано. Разрешите всплывающие окна'
      } else if (error.message) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-primary/40 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2 justify-center">
            <Image src="/logo.png" alt="R&A-Dev" width={40} height={40} className="object-contain" />
            <span className="text-3xl sm:text-4xl font-bold glow-blue">R&A-Dev</span>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Создать аккаунт' : 'Войти'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Создайте аккаунт для доступа к ИИ-ассистенту'
              : 'Войдите для доступа к ИИ-ассистенту и админке'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialAuth(signInWithGoogle)}
            disabled={loading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Войти через Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Или</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            
            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword">Повторите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" variant="neon" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              {loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
