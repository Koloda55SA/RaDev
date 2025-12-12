import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { getDb } from './config'

// Админские почты
const ADMIN_EMAILS = ['ns.zynk.gamer@gmail.com', 'oon66517@gmail.com']

export async function initializeUserRole(uid: string, email: string | null): Promise<'admin' | 'user'> {
  if (!email) {
    console.log('No email provided for user:', uid)
    return 'user'
  }
  
  // Проверяем, является ли email админским
  const emailLower = email.toLowerCase().trim()
  const isAdmin = ADMIN_EMAILS.includes(emailLower)
  
  console.log('Checking user role:', { email: emailLower, isAdmin, adminEmails: ADMIN_EMAILS })
  
  const userRef = doc(getDb(), 'users', uid)
  
  try {
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      // Создаем нового пользователя с соответствующей ролью и базовыми данными
      const role = isAdmin ? 'admin' : 'user'
      const defaultNickname = emailLower.split('@')[0] // Никнейм из email
      await setDoc(userRef, {
        email: emailLower,
        role: role,
        nickname: defaultNickname,
        displayName: defaultNickname,
        achievements: [],
        privacy: {
          showActivity: true, // По умолчанию действия видны
          showAchievements: true,
          showProfile: true,
        },
        stats: {
          projectsViewed: 0,
          blogPostsRead: 0,
          codeRuns: 0,
          messagesSent: 0,
          loginCount: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      console.log('Created new user in DB:', { uid, email: emailLower, role, nickname: defaultNickname })
      return role
    }
    
    // Если пользователь существует, проверяем его роль
    const userData = userSnap.data()
    const currentRole = userData?.role as 'admin' | 'user' | undefined
    
    // Если роль не установлена или не соответствует админскому email, обновляем
    if (isAdmin && currentRole !== 'admin') {
      await setDoc(userRef, { 
        role: 'admin',
        email: emailLower,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      console.log('Updated user to admin:', { uid, email: emailLower })
      return 'admin'
    }
    
    if (!isAdmin && currentRole === 'admin') {
      await setDoc(userRef, { 
        role: 'user',
        email: emailLower,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      console.log('Updated user to regular user:', { uid, email: emailLower })
      return 'user'
    }
    
    // Обновляем email если изменился
    if (userData?.email !== emailLower) {
      await setDoc(userRef, { 
        email: emailLower,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    }
    
    const finalRole = (currentRole as 'admin' | 'user') || 'user'
    console.log('User role from DB:', { uid, email: emailLower, role: finalRole })
    return finalRole
  } catch (error) {
    console.error('Error in initializeUserRole:', error)
    return isAdmin ? 'admin' : 'user'
  }
}

export async function getUserRole(uid: string): Promise<'admin' | 'user' | null> {
  const userRef = doc(getDb(), 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    return null
  }
  
  const userData = userSnap.data()
  return (userData?.role as 'admin' | 'user') || null
}

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

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(getDb(), 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    return null
  }
  
  const data = userSnap.data()
  return {
    uid: userSnap.id,
    email: data.email || '',
    nickname: data.nickname || data.email?.split('@')[0] || 'Пользователь',
    displayName: data.displayName || data.nickname || data.email?.split('@')[0] || 'Пользователь',
    role: data.role || 'user',
    avatar: data.avatar || data.photoURL || undefined,
    bio: data.bio || undefined,
    achievements: data.achievements || [],
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

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(getDb(), 'users', uid)
  await setDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}

export async function checkAndUnlockAchievement(uid: string, achievementId: string): Promise<boolean> {
  const userRef = doc(getDb(), 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    return false
  }
  
  const userData = userSnap.data()
  const achievements = userData?.achievements || []
  
  // Если достижение уже получено, не добавляем снова
  if (achievements.includes(achievementId)) {
    return false
  }
  
  // Добавляем достижение
  await setDoc(userRef, {
    achievements: [...achievements, achievementId],
    updatedAt: new Date().toISOString(),
  }, { merge: true })
  
  return true
}

// Лайки профилей
export async function likeProfile(currentUserId: string, targetUserId: string): Promise<void> {
  if (currentUserId === targetUserId) {
    throw new Error('Нельзя лайкнуть свой профиль')
  }
  
  const likesRef = doc(getDb(), 'profile_likes', targetUserId)
  const likesSnap = await getDoc(likesRef)
  
  const currentLikes = likesSnap.exists() ? (likesSnap.data().likedBy || []) : []
  
  if (currentLikes.includes(currentUserId)) {
    throw new Error('Вы уже лайкнули этот профиль')
  }
  
  await setDoc(likesRef, {
    likedBy: [...currentLikes, currentUserId],
    count: currentLikes.length + 1,
    updatedAt: new Date().toISOString()
  }, { merge: true })
}

export async function unlikeProfile(currentUserId: string, targetUserId: string): Promise<void> {
  const likesRef = doc(getDb(), 'profile_likes', targetUserId)
  const likesSnap = await getDoc(likesRef)
  
  if (!likesSnap.exists()) {
    return
  }
  
  const currentLikes = likesSnap.data().likedBy || []
  const newLikes = currentLikes.filter((uid: string) => uid !== currentUserId)
  
  await setDoc(likesRef, {
    likedBy: newLikes,
    count: newLikes.length,
    updatedAt: new Date().toISOString()
  }, { merge: true })
}

export async function isProfileLiked(currentUserId: string, targetUserId: string): Promise<boolean> {
  const likesRef = doc(getDb(), 'profile_likes', targetUserId)
  const likesSnap = await getDoc(likesRef)
  
  if (!likesSnap.exists()) {
    return false
  }
  
  const likedBy = likesSnap.data().likedBy || []
  return likedBy.includes(currentUserId)
}

export async function getProfileLikesCount(targetUserId: string): Promise<number> {
  const likesRef = doc(getDb(), 'profile_likes', targetUserId)
  const likesSnap = await getDoc(likesRef)
  
  if (!likesSnap.exists()) {
    return 0
  }
  
  return likesSnap.data().count || 0
}

export async function incrementUserStat(uid: string, statName: keyof UserProfile['stats'], amount: number = 1): Promise<void> {
  const userRef = doc(getDb(), 'users', uid)
  const userSnap = await getDoc(userRef)
  
  if (!userSnap.exists()) {
    return
  }
  
  const userData = userSnap.data()
  const currentStats = userData?.stats || {
    projectsViewed: 0,
    blogPostsRead: 0,
    codeRuns: 0,
    messagesSent: 0,
    loginCount: 0,
  }
  
  await setDoc(userRef, {
    stats: {
      ...currentStats,
      [statName]: (currentStats[statName] || 0) + amount,
    },
    updatedAt: new Date().toISOString(),
  }, { merge: true })
}
