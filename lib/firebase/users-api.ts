/**
 * API для работы с пользователями через C# Backend
 * Заменяет lib/firebase/users.ts для работы с данными
 * Firebase используется только для аутентификации
 */

import { apiClient } from '@/lib/api/client'

// Админские почты
const ADMIN_EMAILS = ['ns.zynk.gamer@gmail.com', 'oon66517@gmail.com']

export interface UserProfile {
  uid: string
  email: string
  nickname: string
  displayName: string
  role: 'admin' | 'user'
  avatar?: string
  bio?: string
  achievements: string[]
  privacy: {
    showActivity: boolean
    showAchievements: boolean
    showProfile: boolean
  }
  stats: {
    projectsViewed: number
    blogPostsRead: number
    codeRuns: number
    messagesSent: number
    loginCount: number
  }
  createdAt: string
  updatedAt: string
}

/**
 * Инициализация роли пользователя при первом входе
 * Создает пользователя в C# Backend если его нет
 */
export async function initializeUserRole(uid: string, email: string | null): Promise<'admin' | 'user'> {
  if (!email) {
    console.log('No email provided for user:', uid)
    return 'user'
  }
  
  const emailLower = email.toLowerCase().trim()
  const isAdmin = ADMIN_EMAILS.includes(emailLower)
  const role = isAdmin ? 'admin' : 'user'
  
  try {
    // Получаем профиль пользователя из C# API
    const response = await apiClient.getUserProfile()
    
    if (response.success && response.data) {
      // Пользователь существует, возвращаем его роль
      const userRole = response.data.role || 'user'
      return userRole === 'Admin' || userRole === 'admin' ? 'admin' : 'user'
    }
    
    // Пользователя нет, создаем через C# API
    const defaultNickname = emailLower.split('@')[0]
    const createResponse = await apiClient.updateProfile({
      nickname: defaultNickname,
      bio: '',
    })
    
    if (createResponse.success) {
      console.log('Created new user in C# API:', { uid, email: emailLower, role, nickname: defaultNickname })
      return role
    }
    
    return role
  } catch (error) {
    console.error('Error in initializeUserRole:', error)
    return role
  }
}

/**
 * Получение роли пользователя
 */
export async function getUserRole(uid: string): Promise<'admin' | 'user' | null> {
  try {
    const response = await apiClient.getUserProfile()
    if (response.success && response.data) {
      const userRole = response.data.role || 'user'
      return userRole === 'Admin' || userRole === 'admin' ? 'admin' : 'user'
    }
    return null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Получение профиля пользователя
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const response = await apiClient.getUserProfile(uid)
    if (response.success && response.data) {
      const data = response.data
      return {
        uid: data.id || uid,
        email: data.email || '',
        nickname: data.nickname || data.username || data.email?.split('@')[0] || 'Пользователь',
        displayName: data.displayName || data.nickname || data.username || 'Пользователь',
        role: (data.role === 'Admin' || data.role === 'admin') ? 'admin' : 'user',
        avatar: data.avatar || data.avatarUrl || undefined,
        bio: data.bio || undefined,
        achievements: data.achievements || data.selectedAchievements || [],
        privacy: data.privacy || {
          showActivity: true,
          showAchievements: true,
          showProfile: true,
        },
        stats: data.stats || {
          projectsViewed: 0,
          blogPostsRead: 0,
          codeRuns: 0,
          messagesSent: 0,
          loginCount: 0,
        },
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Обновление профиля пользователя
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    await apiClient.updateProfile({
      nickname: updates.nickname,
      bio: updates.bio,
      avatar: updates.avatar,
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Проверка и разблокировка достижения
 */
export async function checkAndUnlockAchievement(uid: string, achievementId: string): Promise<boolean> {
  try {
    // Получаем текущий профиль
    const profile = await getUserProfile(uid)
    if (!profile) return false
    
    // Проверяем, есть ли уже это достижение
    if (profile.achievements.includes(achievementId)) {
      return false
    }
    
    // Добавляем достижение через обновление профиля
    const updatedAchievements = [...profile.achievements, achievementId]
    await updateUserProfile(uid, {
      achievements: updatedAchievements,
    })
    
    return true
  } catch (error) {
    console.error('Error checking achievement:', error)
    return false
  }
}

/**
 * Лайк профиля (через C# API)
 */
export async function likeProfile(currentUserId: string, targetUserId: string): Promise<void> {
  try {
    const response = await apiClient.likeProfile(targetUserId)
    if (!response.success) {
      throw new Error(response.error || 'Failed to like profile')
    }
  } catch (error) {
    console.error('Error liking profile:', error)
    throw error
  }
}

/**
 * Убрать лайк профиля
 */
export async function unlikeProfile(currentUserId: string, targetUserId: string): Promise<void> {
  try {
    const response = await apiClient.unlikeProfile(targetUserId)
    if (!response.success) {
      throw new Error(response.error || 'Failed to unlike profile')
    }
  } catch (error) {
    console.error('Error unliking profile:', error)
    throw error
  }
}

/**
 * Проверка лайкнул ли пользователь профиль
 */
export async function isProfileLiked(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const response = await apiClient.getUserProfile(targetUserId)
    if (response.success && response.data) {
      // Проверяем через API или локально
      // TODO: Добавить метод в C# API для проверки лайка
      return false // Временно
    }
    return false
  } catch (error) {
    console.error('Error checking profile like:', error)
    return false
  }
}

/**
 * Получение количества лайков профиля
 */
export async function getProfileLikesCount(targetUserId: string): Promise<number> {
  try {
    const response = await apiClient.getUserProfile(targetUserId)
    if (response.success && response.data) {
      return response.data.likesCount || 0
    }
    return 0
  } catch (error) {
    console.error('Error getting profile likes count:', error)
    return 0
  }
}

/**
 * Увеличение статистики пользователя
 */
export async function incrementUserStat(uid: string, statName: keyof UserProfile['stats'], amount: number = 1): Promise<void> {
  try {
    // Получаем текущий профиль
    const profile = await getUserProfile(uid)
    if (!profile) return
    
    // Обновляем статистику
    const updatedStats = {
      ...profile.stats,
      [statName]: (profile.stats[statName] || 0) + amount,
    }
    
    // Обновляем через API (если есть метод для обновления stats)
    // TODO: Добавить метод в C# API для обновления stats
    await updateUserProfile(uid, {
      stats: updatedStats,
    })
  } catch (error) {
    console.error('Error incrementing user stat:', error)
  }
}




