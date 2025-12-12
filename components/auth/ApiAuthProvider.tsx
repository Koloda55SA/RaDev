'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiAuthAdapter, ApiUser } from '@/lib/api/authAdapter'
import { apiClient } from '@/lib/api/client'

interface AuthContextType {
  user: ApiUser | null
  userRole: 'admin' | 'user' | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (code: string) => Promise<void>
  resendVerificationCode: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null)
  const [loading, setLoading] = useState(true)

  // Проверка текущего пользователя при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await apiAuthAdapter.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setUserRole(currentUser.role || 'user')
        }
      } catch (error) {
        console.error('[ApiAuth] Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signInWithGoogle = async () => {
    try {
      // Получаем Google OAuth URL от бэкенда
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!googleClientId) {
        throw new Error('Google Client ID not configured')
      }

      // Перенаправляем на Google OAuth
      const redirectUri = `${window.location.origin}/auth/google/callback`
      const scope = 'openid email profile'
      const responseType = 'code'
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`

      window.location.href = googleAuthUrl
    } catch (error: any) {
      console.error('[ApiAuth] Google sign in error:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    // Вход выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    throw new Error('Вход должен выполняться через Firebase Auth')
  }

  const signUpWithEmail = async (email: string, password: string) => {
    // Регистрация выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    throw new Error('Регистрация должна выполняться через Firebase Auth')
  }

  const logout = async () => {
    try {
      await apiAuthAdapter.signOut()
      setUser(null)
      setUserRole(null)
    } catch (error: any) {
      console.error('[ApiAuth] Logout error:', error)
    }
  }

  const verifyEmail = async (code: string) => {
    try {
      await apiAuthAdapter.verifyEmail(code)
      // Обновляем пользователя после верификации
      const currentUser = await apiAuthAdapter.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error: any) {
      console.error('[ApiAuth] Email verification error:', error)
      throw error
    }
  }

  const resendVerificationCode = async () => {
    try {
      await apiAuthAdapter.resendVerificationCode()
    } catch (error: any) {
      console.error('[ApiAuth] Resend verification code error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        verifyEmail,
        resendVerificationCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

