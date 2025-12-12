/**
 * API для социальных функций
 * Обертка над apiClient для удобства использования
 */

import { apiClient } from './client'

export interface UserSubscription {
  uid: string
  nickname: string
  displayName?: string
  email: string
  avatar?: string
}

/**
 * Поиск пользователей по никнейму
 */
export async function searchUsersByNickname(query: string, currentUserId: string): Promise<UserSubscription[]> {
  try {
    if (!query || query.trim().length < 1) {
      return []
    }
    
    const response = await apiClient.searchUsers(query.trim())
    if (response.success && response.data) {
      return response.data.map((user: any) => {
        let avatarUrl = user.avatar || user.avatarUrl || user.photoURL
        // Если URL относительный, делаем его абсолютным через прокси
        if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
          avatarUrl = `/api/backend${avatarUrl}`
        }
        
        return {
          uid: user.id || user.userId || '',
          nickname: user.nickname || user.username || 'Пользователь',
          displayName: user.displayName || user.nickname || user.username || 'Пользователь',
          email: user.email || '',
          avatar: avatarUrl,
        }
      }).filter((user: UserSubscription) => user.uid && user.uid !== currentUserId)
    }
    return []
  } catch (error) {
    console.error('[SocialAPI] Error searching users:', error)
    return []
  }
}

/**
 * Получение списка подписок
 */
export async function getFollowingList(userId: string): Promise<UserSubscription[]> {
  try {
    const response = await apiClient.getFollowing(userId)
    if (response.success && response.data) {
      return response.data.map((user: any) => {
        let avatarUrl = user.avatar || user.avatarUrl || user.photoURL
        // Если URL относительный, делаем его абсолютным через прокси
        if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
          avatarUrl = `/api/backend${avatarUrl}`
        }
        
        return {
          uid: user.id || user.userId || '',
          nickname: user.nickname || user.username || 'Пользователь',
          displayName: user.displayName || user.nickname || user.username || 'Пользователь',
          email: user.email || '',
          avatar: avatarUrl,
        }
      })
    }
    return []
  } catch (error) {
    console.error('[SocialAPI] Error getting following list:', error)
    return []
  }
}

/**
 * Получение списка подписчиков
 */
export async function getFollowersList(userId: string): Promise<UserSubscription[]> {
  try {
    const response = await apiClient.getFollowers(userId)
    if (response.success && response.data) {
      return response.data.map((user: any) => {
        let avatarUrl = user.avatar || user.avatarUrl || user.photoURL
        // Если URL относительный, делаем его абсолютным через прокси
        if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
          avatarUrl = `/api/backend${avatarUrl}`
        }
        
        return {
          uid: user.id || user.userId || '',
          nickname: user.nickname || user.username || 'Пользователь',
          displayName: user.displayName || user.nickname || user.username || 'Пользователь',
          email: user.email || '',
          avatar: avatarUrl,
        }
      })
    }
    return []
  } catch (error) {
    console.error('[SocialAPI] Error getting followers list:', error)
    return []
  }
}

/**
 * Получение данных о подписках
 */
export async function getSubscriptionData(userId: string) {
  try {
    const response = await apiClient.getSubscriptionData(userId)
    // getSubscriptionData возвращает объект напрямую, не ApiResponse
    return {
      following: (response.following || []).map((user: any) => ({
        uid: user.id || user.userId,
        nickname: user.nickname || user.username || 'Пользователь',
        displayName: user.displayName || user.nickname || user.username || 'Пользователь',
        email: user.email || '',
        avatar: user.avatar || user.photoURL,
      })),
      followers: (response.followers || []).map((user: any) => ({
        uid: user.id || user.userId,
        nickname: user.nickname || user.username || 'Пользователь',
        displayName: user.displayName || user.nickname || user.username || 'Пользователь',
        email: user.email || '',
        avatar: user.avatar || user.photoURL,
      })),
    }
  } catch (error) {
    console.error('[SocialAPI] Error getting subscription data:', error)
    return { following: [], followers: [] }
  }
}

/**
 * Подписка на пользователя
 */
export async function followUser(currentUserId: string, targetUserId: string) {
  try {
    const response = await apiClient.followUser(targetUserId)
    return response.success
  } catch (error) {
    console.error('[SocialAPI] Error following user:', error)
    return false
  }
}

/**
 * Отписка от пользователя
 */
export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    const response = await apiClient.unfollowUser(targetUserId)
    return response.success
  } catch (error) {
    console.error('[SocialAPI] Error unfollowing user:', error)
    return false
  }
}

/**
 * Получение пользователя по ID
 */
export async function getUserById(userId: string): Promise<UserSubscription | null> {
  try {
    const response = await apiClient.getUserProfile(userId)
    if (response.success && response.data) {
      const user = response.data
      return {
        uid: user.id || user.userId || userId,
        nickname: user.nickname || user.username || 'Пользователь',
        displayName: user.displayName || user.nickname || user.username || 'Пользователь',
        email: user.email || '',
        avatar: user.avatar || user.photoURL,
      }
    }
    return null
  } catch (error) {
    console.error('[SocialAPI] Error getting user by id:', error)
    return null
  }
}

/**
 * Блокировка пользователя
 * TODO: Реализовать в C# API
 */
export async function blockUser(currentUserId: string, targetUserId: string) {
  try {
    // TODO: Добавить метод blockUser в apiClient когда будет реализовано в C# API
    console.warn('[SocialAPI] blockUser not yet implemented in C# API')
    throw new Error('Блокировка пользователей пока не реализована')
  } catch (error) {
    console.error('[SocialAPI] Error blocking user:', error)
    throw error
  }
}



