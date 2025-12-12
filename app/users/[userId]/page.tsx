'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Calendar, Trophy, ArrowLeft, UserPlus, UserMinus, Ban, MessageCircle, Heart, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { ACHIEVEMENTS } from '@/lib/achievements'
import AchievementCard from '@/components/achievements/AchievementCard'
import { followUser, unfollowUser, getSubscriptionData, getUserById, blockUser } from '@/lib/api/socialApi'
import { escapeHtml } from '@/lib/utils/security'
import { apiClient } from '@/lib/api/client'
import FollowersFollowingModal from '@/components/users/FollowersFollowingModal'
import { getAllCourses } from '@/lib/courses/courseData'
import toast from 'react-hot-toast'

interface UserProfile {
  uid: string
  email: string
  nickname: string
  displayName?: string
  avatar?: string
  role?: 'admin' | 'user'
  achievements?: any[]
  privacy?: {
    showActivity: boolean
    showAchievements: boolean
    showProfile: boolean
  }
  stats?: {
    projectsViewed: number
    blogPostsRead: number
    codeRuns: number
    messagesSent: number
    loginCount: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const userId = params.userId as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [isBlockedUser, setIsBlockedUser] = useState(false)
  const [followingCount, setFollowingCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [courseProgress, setCourseProgress] = useState<any>(null)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/users/' + userId)
      return
    }

    const currentUserId = ('uid' in currentUser ? currentUser.uid : currentUser.id) || ''
    if (currentUserId === userId) {
      router.push('/profile')
      return
    }

    loadProfile()
  }, [userId, currentUser, router])

  const loadProfile = async () => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      const response = await apiClient.getUserProfile(userId)
      if (!response.success || !response.data) {
        toast.error('Пользователь не найден')
        router.push('/users/search')
        return
      }

      const userData = response.data
      const userProfile: UserProfile = {
        uid: userId,
        email: userData.email || '',
        nickname: userData.nickname || userData.username || 'Пользователь',
        displayName: userData.displayName || userData.nickname || userData.username || 'Пользователь',
        avatar: userData.avatar || userData.photoURL,
        role: userData.role || 'user',
        achievements: userData.achievements || [],
        privacy: {
          showActivity: userData.privacy?.showActivity ?? true,
          showAchievements: userData.privacy?.showAchievements ?? true,
          showProfile: userData.privacy?.showProfile ?? true,
        } as { showActivity: boolean; showAchievements: boolean; showProfile: boolean },
        stats: userData.stats || {
          projectsViewed: 0,
          blogPostsRead: 0,
          codeRuns: 0,
          messagesSent: 0,
          loginCount: 0,
        },
      }

      // Проверяем приватность
      if (!userProfile.privacy?.showProfile) {
        toast.error('Профиль пользователя скрыт')
        router.push('/users/search')
        return
      }

      setProfile(userProfile)

      // Проверяем подписку
      const followingResponse = await apiClient.getFollowing()
      const followingList = followingResponse.success ? followingResponse.data || [] : []
      const followingIds = new Set(followingList.map((u: any) => u.id || u.userId))
      setIsFollowingUser(followingIds.has(userId))
      setIsBlockedUser(false) // Блокировка пока не реализована

      // Загружаем статистику подписок
      const subData = await getSubscriptionData(userId)
      if (userProfile.privacy && userProfile.privacy.showActivity !== false) {
        setFollowingCount(subData.following.length)
        setFollowersCount(subData.followers.length)
      } else {
        setFollowingCount(0)
        setFollowersCount(0)
      }

      // Загружаем прогресс по курсам (если реализовано в API)
      try {
        // TODO: Реализовать загрузку прогресса через API
        setCourseProgress(null)
      } catch (error) {
        console.error('Error loading course progress:', error)
      }

      // Загружаем лайки (если реализовано в API)
      try {
        // TODO: Реализовать проверку лайков через API
        setIsLiked(false)
        setLikesCount(0)
      } catch (error) {
        console.error('Error loading likes:', error)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Ошибка загрузки профиля')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUser || !profile) return
    
    try {
      const currentUserId = ('uid' in currentUser ? currentUser.uid : currentUser.id) || ''
      if (!currentUserId) return
      await followUser(currentUserId, userId)
      setIsFollowingUser(true)
      setFollowersCount(prev => prev + 1)
      toast.success(`Подписались на ${profile.nickname}`)
    } catch (error: any) {
      console.error('Error following user:', error)
      toast.error(error.message || 'Ошибка подписки')
    }
  }

  const handleUnfollow = async () => {
    if (!currentUser || !profile) return
    
    try {
      const currentUserId = ('uid' in currentUser ? currentUser.uid : currentUser.id) || ''
      if (!currentUserId) return
      await unfollowUser(currentUserId, userId)
      setIsFollowingUser(false)
      setFollowersCount(prev => Math.max(0, prev - 1))
      toast.success(`Отписались от ${profile.nickname}`)
    } catch (error: any) {
      console.error('Error unfollowing user:', error)
      toast.error('Ошибка отписки')
    }
  }

  const handleBlock = async () => {
    if (!currentUser || !profile) return
    
    if (!confirm(`Заблокировать ${profile.nickname}? Вы не сможете писать друг другу.`)) {
      return
    }
    
    try {
      const currentUserId = ('uid' in currentUser ? currentUser.uid : currentUser.id) || ''
      if (!currentUserId) return
      await blockUser(currentUserId, userId)
      setIsBlockedUser(true)
      setIsFollowingUser(false)
      toast.success(`${profile.nickname} заблокирован`)
    } catch (error: any) {
      console.error('Error blocking user:', error)
      toast.error(error.message || 'Ошибка блокировки')
    }
  }

  const handleStartChat = () => {
    router.push(`/chat?user=${userId}`)
  }

  const handleLike = async () => {
    if (!currentUser) return
    
    try {
      if (isLiked) {
        const response = await apiClient.unlikeProfile(userId)
        if (response.success) {
          setIsLiked(false)
          setLikesCount(prev => Math.max(0, prev - 1))
          toast.success('Лайк убран')
        } else {
          throw new Error(response.error || 'Ошибка удаления лайка')
        }
      } else {
        const response = await apiClient.likeProfile(userId)
        if (response.success) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)
          toast.success('Профиль лайкнут')
        } else {
          throw new Error(response.error || 'Ошибка лайка')
        }
      }
    } catch (error: any) {
      console.error('Error liking profile:', error)
      toast.error(error.message || 'Ошибка лайка')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-primary/40 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const unlockedAchievements = (profile.achievements || [])
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean) as typeof ACHIEVEMENTS

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/users/search">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к поиску
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{escapeHtml(profile.nickname || 'Пользователь')}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {escapeHtml(profile.email)}
                  </CardDescription>
                  {(profile as any).bio && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      {escapeHtml((profile as any).bio)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {likesCount}
                </Button>
                {isBlockedUser ? (
                  <Button variant="outline" disabled>
                    <Ban className="h-4 w-4 mr-2" />
                    Заблокирован
                  </Button>
                ) : (
                  <>
                    {isFollowingUser ? (
                      <Button variant="outline" onClick={handleUnfollow}>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Отписаться
                      </Button>
                    ) : (
                      <Button onClick={handleFollow}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Подписаться
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleStartChat}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Написать
                    </Button>
                    <Button variant="destructive" onClick={handleBlock}>
                      <Ban className="h-4 w-4 mr-2" />
                      Заблокировать
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {profile.privacy && profile.privacy.showActivity !== false ? (
                <>
                  <button
                    onClick={() => setShowFollowingModal(true)}
                    className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <p className="text-xs text-muted-foreground">Подписки</p>
                    <p className="text-lg font-semibold">{followingCount}</p>
                  </button>
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <p className="text-xs text-muted-foreground">Подписчики</p>
                    <p className="text-lg font-semibold">{followersCount}</p>
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Подписки</p>
                    <p className="text-lg font-semibold">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Подписчики</p>
                    <p className="text-lg font-semibold">—</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Проектов просмотрено</p>
                    <p className="text-lg font-semibold">{profile.stats?.projectsViewed || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Достижений</p>
                <p className="text-lg font-semibold">{profile.achievements?.length || 0}</p>
              </div>
              {courseProgress && (
                <div>
                  <p className="text-xs text-muted-foreground">Курсов пройдено</p>
                  <p className="text-lg font-semibold">
                    {Object.values(courseProgress).filter((c: any) => c.totalCompleted > 0).length}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {courseProgress && Object.keys(courseProgress).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Прогресс по курсам
              </CardTitle>
              <CardDescription>
                Курсы, которые изучает {profile.nickname}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(courseProgress).map(([language, progress]: [string, any]) => {
                  if (!progress || progress.totalCompleted === 0) return null
                  const percentage = progress.totalLessons > 0 
                    ? Math.round((progress.totalCompleted / progress.totalLessons) * 100)
                    : 0
                  const courses = getAllCourses()
                  const course = courses.find(c => c.language === language)
                  
                  return (
                    <div key={language} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📚</span>
                          <span className="font-semibold">{course?.title || language}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {progress.totalCompleted} / {progress.totalLessons}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{percentage}% завершено</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.privacy?.showAchievements && unlockedAchievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Достижения ({unlockedAchievements.length})
              </CardTitle>
              <CardDescription>
                Достижения пользователя {profile.nickname}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <FollowersFollowingModal
        userId={userId}
        open={showFollowersModal}
        onOpenChange={setShowFollowersModal}
        initialTab="followers"
      />
      <FollowersFollowingModal
        userId={userId}
        open={showFollowingModal}
        onOpenChange={setShowFollowingModal}
        initialTab="following"
      />
    </div>
  )
}
