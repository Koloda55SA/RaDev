'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          toast.error('Ошибка авторизации через Google')
          router.push('/login')
          return
        }

        if (!code) {
          toast.error('Код авторизации не получен')
          router.push('/login')
          return
        }

        // Отправляем код на сервер для обмена на токен
        console.log('[GoogleCallback] Sending authorization code to server...')
        let response
        try {
          response = await fetch('/api/auth/google-callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })
        } catch (fetchError: any) {
          console.error('[GoogleCallback] Fetch error:', fetchError)
          throw new Error(`Не удалось подключиться к серверу: ${fetchError.message || 'Network error'}`)
        }

        const data = await response.json()
        console.log('[GoogleCallback] Server response:', {
          ok: response.ok,
          status: response.status,
          hasToken: !!data.token,
          hasUser: !!data.user,
          error: data.error,
          dataKeys: Object.keys(data)
        })

        if (!response.ok) {
          const errorMessage = data.error || 'Ошибка авторизации'
          const errorDetails = data.details ? `\nДетали: ${data.details}` : ''
          console.error('[GoogleCallback] Error response:', errorMessage, errorDetails)
          throw new Error(`${errorMessage}${errorDetails}`)
        }

        // Проверяем наличие токена
        if (!data.token) {
          console.error('[GoogleCallback] No token in response:', data)
          throw new Error('Токен не получен от сервера')
        }

        // Сохраняем токен в localStorage
        localStorage.setItem('auth_token', data.token)
        console.log('[GoogleCallback] Token saved to localStorage')
        
        // Сохраняем информацию о пользователе (если есть)
        if (data.user) {
          localStorage.setItem('auth_user', JSON.stringify(data.user))
          console.log('[GoogleCallback] User data saved:', {
            id: data.user.id,
            email: data.user.email,
            name: data.user.displayName || data.user.name
          })
        } else {
          console.warn('[GoogleCallback] No user data in response')
        }
        
        // Показываем предупреждение, если используется временное решение
        if (data.warning) {
          toast.success('Вход выполнен! (Временное решение - бэкенд недоступен)', {
            duration: 5000,
            icon: '⚠️'
          })
          console.warn('[GoogleCallback]', data.warning)
        } else {
          toast.success('Успешный вход через Google!')
        }
        
        // Небольшая задержка перед редиректом, чтобы пользователь увидел сообщение
        setTimeout(() => {
          console.log('[GoogleCallback] Redirecting to home page...')
          window.location.href = '/'
        }, 500)
      } catch (error: any) {
        console.error('[GoogleCallback] Error:', error)
        toast.error(error.message || 'Ошибка при входе через Google')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Обработка авторизации...</p>
        </div>
      </div>
    )
  }

  return null
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

