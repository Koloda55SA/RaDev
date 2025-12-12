'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

// Проверка что auth инициализирован
if (typeof window !== 'undefined' && !auth) {
  console.error('[Auth] Firebase auth not initialized!')
}
import { initializeUserRole, getUserRole, incrementUserStat, checkAndUnlockAchievement, getUserProfile } from '@/lib/firebase/users-api'
import { checkAchievements, getAchievementById } from '@/lib/achievements'
import CompleteProfileModal from './CompleteProfileModal'

interface AuthContextType {
  user: User | null
  userRole: 'admin' | 'user' | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompleteProfile, setShowCompleteProfile] = useState(false)
  const redirectUserRef = useRef<User | null>(null)
  const isProcessingRedirectRef = useRef(false)

  // Основная логика инициализации
  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      // КРИТИЧНО: На мобильных после редиректа нужно ждать восстановления сессии
      let authInitialized = false
      let userFound = false
      
      // СНАЧАЛА проверяем JWT токен из C# бэкенда (для Google OAuth)
      if (typeof window !== 'undefined') {
        const jwtToken = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('auth_user')
        
        if (jwtToken && userData) {
          try {
            const user = JSON.parse(userData)
            console.log('[Auth] Found JWT token and user data from localStorage')
            setUser(user as any)
            userFound = true
            
            // Получаем роль пользователя
            try {
              const role = await initializeUserRole(user.id || user.uid, user.email)
              if (mounted) setUserRole(role)
            } catch (e) {
              if (mounted) setUserRole('user')
            }
            
            if (mounted) {
              setLoading(false)
              return
            }
          } catch (error) {
            console.error('[Auth] Error parsing user data from localStorage:', error)
            // Очищаем невалидные данные
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
          }
        }
      }
      
      // Проверяем, есть ли признаки OAuth редиректа в URL
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const hasOAuthParams = urlParams && (urlParams.has('__firebase_request_key') || window.location.hash.includes('access_token'))
      
      if (hasOAuthParams) {
        console.log('[Auth] OAuth redirect detected in URL, waiting for session restoration...')
        isProcessingRedirectRef.current = true
      }
      
      // Инициализируем Firebase auth если нужно (для email/password и других провайдеров)
      let authInstanceForInit = auth
      if (!authInstanceForInit) {
        try {
          const { initializeAuth } = await import('@/lib/firebase/config')
          authInstanceForInit = await initializeAuth()
        } catch (initError) {
          console.error('[Auth] Error initializing auth in initAuth:', initError)
          // Если нет Firebase, но есть JWT токен - это нормально
          if (!localStorage.getItem('auth_token')) {
            if (mounted) setLoading(false)
            return
          }
        }
      }

      // 1. СНАЧАЛА проверяем auth.currentUser (может быть уже восстановлен)
      if (authInstanceForInit && authInstanceForInit.currentUser && mounted) {
        const currentUser = authInstanceForInit.currentUser
        console.log('[Auth] Found existing currentUser immediately:', currentUser.email)
        redirectUserRef.current = currentUser
        setUser(currentUser)
        userFound = true
            try {
              const role = await initializeUserRole(currentUser.uid, currentUser.email)
              if (mounted) setUserRole(role)
              
              // Отслеживаем вход для достижений
              try {
                await incrementUserStat(currentUser.uid, 'loginCount', 1)
                await checkAndUnlockAchievements(currentUser.uid, undefined)
              } catch (achievementError) {
                // Игнорируем ошибки достижений
                console.log('Achievement tracking error:', achievementError)
              }
            } catch (e) {
              if (mounted) setUserRole('user')
            }
      }
      
      // 2. Проверяем результат редиректа
      if (!userFound && authInstanceForInit) {
        isProcessingRedirectRef.current = true
        try {
          console.log('[Auth] Checking for redirect result...')
          const redirectResult = await getRedirectResult(authInstanceForInit)
          console.log('[Auth] Redirect result:', redirectResult ? 'Found' : 'None')
          
          if (redirectResult && redirectResult.user && mounted) {
            userFound = true
            redirectUserRef.current = redirectResult.user
            console.log('[Auth] Successfully signed in with redirect:', redirectUserRef.current.email, redirectUserRef.current.uid)
            setUser(redirectUserRef.current)
            
            try {
              const role = await initializeUserRole(redirectUserRef.current.uid, redirectUserRef.current.email)
              console.log('[Auth] User role initialized from redirect:', role)
              if (mounted) setUserRole(role)
              
                    // Отслеживаем вход для достижений
                    await incrementUserStat(redirectUserRef.current.uid, 'loginCount', 1)
                    await checkAndUnlockAchievements(redirectUserRef.current.uid, undefined)
            } catch (e) {
              console.error('[Auth] Error initializing role:', e)
              if (mounted) setUserRole('user')
            }
          }
        } catch (error: any) {
          console.error('[Auth] Redirect result error:', error.code, error.message)
        }
      }
      
      // 3. Если не нашли пользователя, ждем восстановления сессии (критично для мобильных)
      if (!userFound && typeof window !== 'undefined') {
        console.log('[Auth] Waiting for Firebase session restoration (up to 5 seconds)...')
        
        // Проверяем auth.currentUser с задержками
        for (let i = 0; i < 25; i++) {
          await new Promise(resolve => setTimeout(resolve, 200))
          if (authInstanceForInit && authInstanceForInit.currentUser && mounted) {
            const currentUser = authInstanceForInit.currentUser
            console.log('[Auth] Found currentUser after waiting', i + 1, 'times:', currentUser.email)
            redirectUserRef.current = currentUser
            setUser(currentUser)
            userFound = true
            try {
              const role = await initializeUserRole(currentUser.uid, currentUser.email)
              if (mounted) setUserRole(role)
            } catch (e) {
              if (mounted) setUserRole('user')
            }
            break
          }
        }
      }
      
      // 4. Подписываемся на изменения состояния
      // Используем уже инициализированный authInstanceForInit
      if (!authInstanceForInit) {
        console.error('[Auth] Auth not initialized, cannot subscribe to auth state')
        if (mounted) setLoading(false)
        return
      }
      
      const unsubscribe = onAuthStateChanged(authInstanceForInit, async (currentUser) => {
        if (!mounted) return
        
        console.log('[Auth] onAuthStateChanged triggered, user:', currentUser ? currentUser.email : 'null')
        
        if (currentUser) {
          console.log('[Auth] onAuthStateChanged: User authenticated:', currentUser.email, currentUser.uid)
          
          // ВСЕГДА обновляем пользователя
          redirectUserRef.current = currentUser
          setUser(currentUser)
          userFound = true
          
          try {
            const role = await initializeUserRole(currentUser.uid, currentUser.email)
            console.log('[Auth] Role initialized:', role)
            if (mounted) setUserRole(role)
            
            // Проверяем, заполнен ли профиль
            // Показываем модальное окно только если:
            // 1. Профиль не заполнен
            // 2. Пользователь еще не закрыл это модальное окно (проверяем localStorage)
            const profile = await getUserProfile(currentUser.uid)
            const hasClosedModal = typeof window !== 'undefined' && localStorage.getItem(`profile_complete_modal_closed_${currentUser.uid}`)
            if ((!profile || !profile.nickname || profile.nickname.trim() === '') && !hasClosedModal) {
              if (mounted) setShowCompleteProfile(true)
            }
          } catch (error) {
            console.error('[Auth] Role init error:', error)
            if (mounted) setUserRole('user')
          }
          
          // КРИТИЧНО: Если пользователь авторизован и мы на странице логина - редиректим СРАЗУ
          if (typeof window !== 'undefined' && mounted) {
            const currentPath = window.location.pathname
            if (currentPath === '/login' || currentPath === '/admin/login' || currentPath.startsWith('/login')) {
              console.log('[Auth] onAuthStateChanged: User authenticated on login page, redirecting NOW')
              window.location.replace('/')
            }
          }
        } else {
          // Если пользователя нет, но мы обрабатываем редирект - не сбрасываем сразу
          console.log('[Auth] onAuthStateChanged: User not authenticated')
          if (!isProcessingRedirectRef.current && !hasOAuthParams) {
            redirectUserRef.current = null
            setUser(null)
            setUserRole(null)
            userFound = false
          }
        }
        
        // Снимаем loading ТОЛЬКО после того, как состояние установлено
        if (!authInitialized && mounted) {
          authInitialized = true
          setLoading(false)
          console.log('[Auth] Loading set to false, user:', currentUser ? currentUser.email : 'null', 'userFound:', userFound)
        }
      })
      
      // Сбрасываем флаг обработки редиректа через 3 секунды
      setTimeout(() => {
        isProcessingRedirectRef.current = false
      }, 3000)

      return unsubscribe
    }

    const unsubscribePromise = initAuth()

    return () => {
      mounted = false
      // Очистка подписки, если она была создана
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe && typeof unsubscribe === 'function') unsubscribe()
      })
    }
  }, [])

  const signInWithGoogle = async () => {
    // Убеждаемся, что мы на клиенте
    if (typeof window === 'undefined') {
      throw new Error('Авторизация доступна только в браузере')
    }
    
    try {
      // Получаем Client ID из переменных окружения
      // Используем хардкод как fallback, если переменная не установлена
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
      
      if (!googleClientId) {
        console.error('[Auth] Google Client ID не найден в переменных окружения')
        throw new Error('Google Client ID не настроен. Пожалуйста, проверьте настройки.')
      }
      
      // Формируем redirect URI
      // ВАЖНО: Согласно документации Google, redirect_uri должен ТОЧНО совпадать с зарегистрированным в Google Console
      // Используем фиксированный production URL, чтобы гарантировать совпадение
      const productionRedirectUri = 'https://radev-test-2.vercel.app/auth/google/callback'
      const currentOrigin = window.location.origin.replace(/\/+$/, '')
      
      // Определяем, какой redirect_uri использовать
      // Если текущий домен - production, используем его, иначе используем production
      let redirectUri: string
      if (currentOrigin === 'https://radev-test-2.vercel.app' || currentOrigin === 'https://radev.digital') {
        // Используем текущий домен, если это production
        redirectUri = `${currentOrigin}/auth/google/callback`
      } else {
        // Для preview деплоев используем production redirect_uri
        // Это работает, так как callback обрабатывается на production домене
        redirectUri = productionRedirectUri
      }
      
      // Детальное логирование для отладки
      console.log('[Auth] ===== Google OAuth Debug =====')
      console.log('[Auth] Current URL:', window.location.href)
      console.log('[Auth] Current Origin:', currentOrigin)
      console.log('[Auth] Client ID:', googleClientId)
      console.log('[Auth] Redirect URI (will be used):', redirectUri)
      console.log('[Auth] Expected in Google Console:', productionRedirectUri)
      console.log('[Auth] Match:', redirectUri === productionRedirectUri ? '✅ MATCH' : '⚠️ Using current origin')
      console.log('[Auth] =============================')
      
      // Формируем URL для Google OAuth
      const scope = 'openid email profile'
      const responseType = 'code'
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(googleClientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=${responseType}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=select_account`
      
      console.log('[Auth] Full Google OAuth URL:', googleAuthUrl.substring(0, 200) + '...')
      console.log('[Auth] Redirecting to Google OAuth...')
      
      // Перенаправляем на Google OAuth
      window.location.href = googleAuthUrl
    } catch (error: any) {
      console.error('[Auth] Google sign-in error:', error)
      throw new Error(error.message || 'Ошибка входа через Google')
    }
  }

  const signInWithGitHub = async () => {
    if (typeof window === 'undefined') {
      throw new Error('Авторизация доступна только в браузере')
    }
    let authInstance = auth
    if (!authInstance) {
      const { initializeAuth } = await import('@/lib/firebase/config')
      authInstance = await initializeAuth()
    }
    if (!authInstance) {
      throw new Error('Firebase Auth не инициализирован')
    }
    const provider = new GithubAuthProvider()
    provider.addScope('user:email')
    await signInWithPopup(authInstance, provider)
  }

  const signInWithApple = async () => {
    if (typeof window === 'undefined') {
      throw new Error('Авторизация доступна только в браузере')
    }
    let authInstance = auth
    if (!authInstance) {
      const { initializeAuth } = await import('@/lib/firebase/config')
      authInstance = await initializeAuth()
    }
    if (!authInstance) {
      throw new Error('Firebase Auth не инициализирован')
    }
    const provider = new OAuthProvider('apple.com')
    await signInWithPopup(authInstance, provider)
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Авторизация доступна только в браузере')
    }
    let authInstance = auth
    if (!authInstance) {
      const { initializeAuth } = await import('@/lib/firebase/config')
      authInstance = await initializeAuth()
    }
    if (!authInstance) {
      throw new Error('Firebase Auth не инициализирован')
    }
    try {
      await signInWithEmailAndPassword(authInstance, email, password)
    } catch (error: any) {
      // Улучшаем сообщения об ошибках
      let errorMessage = 'Ошибка входа'
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Пользователь с таким email не найден'
          break
        case 'auth/wrong-password':
          errorMessage = 'Неверный пароль'
          break
        case 'auth/invalid-email':
          errorMessage = 'Неверный формат email'
          break
        case 'auth/user-disabled':
          errorMessage = 'Аккаунт заблокирован'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Слишком много попыток. Попробуйте позже'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Ошибка сети. Проверьте подключение'
          break
        default:
          errorMessage = error.message || 'Ошибка входа'
      }
      const enhancedError = new Error(errorMessage)
      ;(enhancedError as any).code = error.code
      throw enhancedError
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    if (typeof window === 'undefined') {
      throw new Error('Авторизация доступна только в браузере')
    }
    let authInstance = auth
    if (!authInstance) {
      const { initializeAuth } = await import('@/lib/firebase/config')
      authInstance = await initializeAuth()
    }
    if (!authInstance) {
      throw new Error('Firebase Auth не инициализирован')
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)
      // Инициализируем роль для нового пользователя
      if (userCredential.user) {
        try {
          await initializeUserRole(userCredential.user.uid, userCredential.user.email)
        } catch (e) {
          console.error('[Auth] Error initializing role for new user:', e)
        }
      }
      // Не возвращаем userCredential, так как интерфейс ожидает void
    } catch (error: any) {
      // Улучшаем сообщения об ошибках
      let errorMessage = 'Ошибка регистрации'
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email уже используется'
          break
        case 'auth/invalid-email':
          errorMessage = 'Неверный формат email'
          break
        case 'auth/weak-password':
          errorMessage = 'Пароль слишком слабый (минимум 6 символов)'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Регистрация по email отключена'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Ошибка сети. Проверьте подключение'
          break
        default:
          errorMessage = error.message || 'Ошибка регистрации'
      }
      const enhancedError = new Error(errorMessage)
      ;(enhancedError as any).code = error.code
      throw enhancedError
    }
  }

  const logout = async () => {
    if (typeof window === 'undefined') {
      return
    }
    
    // Очищаем JWT токен и данные пользователя из localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    // Если есть Firebase auth, выходим и оттуда
    let authInstance = auth
    if (!authInstance) {
      try {
        const { initializeAuth } = await import('@/lib/firebase/config')
        authInstance = await initializeAuth()
      } catch {
        // Firebase не инициализирован - это нормально для Google OAuth через C# бэкенд
      }
    }
    
    if (authInstance) {
      try {
        await firebaseSignOut(authInstance)
      } catch (error) {
        console.error('Firebase logout error:', error)
        // Продолжаем даже если Firebase logout не удался
      }
    }
    
    setUser(null)
    setUserRole(null)
    window.location.href = '/'
  }

  const handleProfileComplete = () => {
    setShowCompleteProfile(false)
    // Сохраняем в localStorage, что пользователь закрыл модальное окно
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`profile_complete_modal_closed_${user.uid}`, 'true')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      signInWithGoogle,
      signInWithGitHub,
      signInWithApple,
      signInWithEmail,
      signUpWithEmail,
      logout
    }}>
      {children}
      {user && showCompleteProfile && (
        <CompleteProfileModal
          open={showCompleteProfile}
          user={user}
          userRole={userRole}
          onComplete={handleProfileComplete}
        />
      )}
    </AuthContext.Provider>
  )
}

// useAuth экспортируется из единого файла useAuth.ts

// Функция для проверки и разблокировки достижений
async function checkAndUnlockAchievements(uid: string, action?: string) {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) return

    // Проверяем стандартные достижения по статистике и действиям
    const unlocked = checkAchievements(profile.stats, action)
    
    // Проверяем кастомные достижения
    const { getSubscriptionData } = await import('@/lib/api/socialApi')
    const { getUserCourseProgress } = await import('@/lib/courses/userProgress')
    
    // Проверяем достижение "Популярный" (10 подписчиков)
    try {
      const subData = await getSubscriptionData(uid)
      if (subData.followers.length >= 10) {
        unlocked.push('get_10_followers')
      }
    } catch (error) {
      console.error('Error checking followers:', error)
    }
    
    // Проверяем достижение "Ученик" (5 завершенных курсов)
    try {
      const courseProgress = await getUserCourseProgress(uid)
      if (courseProgress?.courses) {
        const completedCourses = Object.values(courseProgress.courses).filter(
          (course: any) => course.totalCompleted >= course.totalLessons && course.totalLessons > 0
        ).length
        if (completedCourses >= 5) {
          unlocked.push('complete_5_courses')
        }
      }
    } catch (error) {
      console.error('Error checking courses:', error)
    }
    
    // Проверяем достижение "Дружелюбный" (10 лайков профилей)
    // Это нужно проверять отдельно, так как нужно считать лайки, которые поставил пользователь
    // Для упрощения, проверяем это при лайке профиля
    
    for (const achievementId of unlocked) {
      const wasNew = await checkAndUnlockAchievement(uid, achievementId)
      if (wasNew) {
        // Показываем уведомление о новом достижении
        const achievement = getAchievementById(achievementId)
        if (achievement && typeof window !== 'undefined') {
          const toast = (await import('react-hot-toast')).default
          toast.success(`🎉 Достижение разблокировано: ${achievement.name}!`, {
            duration: 5000,
            icon: achievement.icon,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}
