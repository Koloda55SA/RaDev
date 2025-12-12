'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/auth/useAuth'
import { incrementUserStat, checkAndUnlockAchievement, getUserProfile } from '@/lib/firebase/users-api'
import { checkAchievements } from '@/lib/achievements'
import toast from 'react-hot-toast'

export function useActivityTracking() {
  const { user } = useAuth()

  const trackProjectView = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await incrementUserStat(userId, 'projectsViewed', 1)
      await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Error tracking project view:', error)
    }
  }

  const trackBlogRead = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await incrementUserStat(userId, 'blogPostsRead', 1)
      await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Error tracking blog read:', error)
    }
  }

  const trackCodeRun = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await incrementUserStat(userId, 'codeRuns', 1)
      await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Error tracking code run:', error)
    }
  }

  const trackMessageSent = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await incrementUserStat(userId, 'messagesSent', 1)
      await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Error tracking message sent:', error)
    }
  }

  const trackLogin = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await incrementUserStat(userId, 'loginCount', 1)
      await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Error tracking login:', error)
    }
  }

  return {
    trackProjectView,
    trackBlogRead,
    trackCodeRun,
    trackMessageSent,
    trackLogin,
  }
}

async function checkAndUnlockAchievements(uid: string) {
  try {
    const profile = await getUserProfile(uid)
    if (!profile) return

    const unlocked = checkAchievements(profile.stats)
    
    for (const achievementId of unlocked) {
      const wasNew = await checkAndUnlockAchievement(uid, achievementId)
      if (wasNew) {
        // Показываем уведомление о новом достижении
        const achievement = await import('@/lib/achievements').then(m => m.getAchievementById(achievementId))
        if (achievement) {
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





