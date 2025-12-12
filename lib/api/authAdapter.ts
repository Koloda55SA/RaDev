/**
 * Адаптер для аутентификации через C# API
 * Предоставляет интерфейс, совместимый с Firebase User
 */

import { apiClient } from './client'

export interface ApiUser {
  id: string
  email: string
  username?: string
  emailVerified: boolean
  role?: 'admin' | 'user'
  avatar?: string
  nickname?: string
}

/**
 * Преобразование API пользователя в формат, совместимый с Firebase User
 */
export function adaptApiUser(apiUser: any): ApiUser {
  return {
    id: apiUser.id || apiUser.userId,
    email: apiUser.email,
    username: apiUser.username,
    emailVerified: apiUser.emailVerified || false,
    role: apiUser.role || 'user',
    avatar: apiUser.avatar,
    nickname: apiUser.nickname,
  }
}

/**
 * Адаптер для методов аутентификации
 */
export const apiAuthAdapter = {
  /**
   * Регистрация
   */
  async signUp(email: string, password: string, username?: string) {
    // Регистрация выполняется через Firebase Auth
    // После успешной регистрации в Firebase, пользователь автоматически создается в C# API
    // Этот метод не должен вызываться напрямую - используйте Firebase Auth
    throw new Error('Регистрация должна выполняться через Firebase Auth')
  },

  /**
   * Вход
   */
  async signIn(email: string, password: string) {
    // Вход выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    throw new Error('Вход должен выполняться через Firebase Auth')
  },

  /**
   * Вход через Google
   */
  async signInWithGoogle(code: string) {
    // Вход через Google выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    throw new Error('Вход через Google должен выполняться через Firebase Auth')
  },

  /**
   * Выход
   */
  async signOut() {
    // Выход выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    // Просто очищаем локальное состояние
  },

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(): Promise<ApiUser | null> {
    const response = await apiClient.getCurrentUser()
    if (response.success && response.data) {
      return adaptApiUser(response.data)
    }
    return null
  },

  /**
   * Верификация email
   */
  async verifyEmail(code: string) {
    // Верификация email выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    throw new Error('Верификация email должна выполняться через Firebase Auth')
  },

  /**
   * Повторная отправка кода верификации
   */
  async resendVerificationCode() {
    // Повторная отправка кода верификации выполняется через Firebase Auth
    // Этот метод не должен использоваться - используйте Firebase Auth напрямую
    throw new Error('Повторная отправка кода должна выполняться через Firebase Auth')
  },
}


