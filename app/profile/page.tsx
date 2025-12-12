'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, LogOut, Mail, Calendar, Settings, Edit, Trophy, Eye, EyeOff, Save, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api/client'
import { getSubscriptionData } from '@/lib/api/socialApi'
import { ACHIEVEMENTS, getAchievementById } from '@/lib/achievements'
import AchievementCard from '@/components/achievements/AchievementCard'
import { getFollowingList, getFollowersList } from '@/lib/api/socialApi'

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
import { Users, UserPlus } from 'lucide-react'
import FollowersFollowingModal from '@/components/users/FollowersFollowingModal'

export default function ProfilePage() {
  const { user, userRole, loading, logout } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [editingNickname, setEditingNickname] = useState(false)
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [followingCount, setFollowingCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    try {
      const response = await apiClient.getUserProfile()
      if (response.success && response.data) {
        const userData = response.data
        const userProfile: UserProfile = {
          uid: ('uid' in user ? user.uid : user.id) || '',
          email: userData.email || user.email || '',
          nickname: userData.nickname || userData.username || user.email?.split('@')[0] || 'Пользователь',
          displayName: userData.displayName || userData.nickname || userData.username || user.email?.split('@')[0] || 'Пользователь',
          avatar: (() => {
            let avatarUrl = userData.avatar || userData.avatarUrl || ('photoURL' in user ? user.photoURL : '') || ''
            // Если URL относительный, делаем его абсолютным через прокси
            if (avatarUrl && avatarUrl.startsWith('/uploads/')) {
              avatarUrl = `/api/backend${avatarUrl}`
            }
            return avatarUrl
          })(),
          role: userData.role || userRole || 'user',
          achievements: userData.achievements || [],
          privacy: {
            showActivity: Boolean(userData.privacy?.showActivity ?? true),
            showAchievements: Boolean(userData.privacy?.showAchievements ?? true),
            showProfile: Boolean(userData.privacy?.showProfile ?? true),
          } as { showActivity: boolean; showAchievements: boolean; showProfile: boolean },
          stats: userData.stats || {
            projectsViewed: 0,
            blogPostsRead: 0,
            codeRuns: 0,
            messagesSent: 0,
            loginCount: 0,
          },
        }
        setProfile(userProfile)
        setNickname(userProfile.nickname)
      } else {
        // Создаем базовый профиль если его нет
        const defaultProfile: UserProfile = {
          uid: ('uid' in user ? user.uid : user.id) || '',
          email: user.email || '',
          nickname: user.email?.split('@')[0] || 'Пользователь',
          displayName: ('displayName' in user ? user.displayName : null) || user.email?.split('@')[0] || 'Пользователь',
          avatar: ('photoURL' in user ? user.photoURL : '') || '',
          role: userRole || 'user',
          achievements: [],
          privacy: {
            showActivity: true,
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
        }
        // Создаем профиль через API
        await apiClient.updateProfile({
          nickname: defaultProfile.nickname,
          bio: '',
        })
        setProfile(defaultProfile)
        setNickname(defaultProfile.nickname)
      }
      
      // Загружаем данные о подписках
      if (user) {
        try {
          const userId = ('uid' in user ? user.uid : user.id) || ''
          if (!userId) return
          const subData = await getSubscriptionData(userId)
          setFollowingCount(subData.following.length)
          setFollowersCount(subData.followers.length)
        } catch (error) {
          console.error('Error loading subscriptions:', error)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Ошибка загрузки профиля')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSaveNickname = async () => {
    if (!user || !profile) return
    
    if (!nickname.trim()) {
      toast.error('Никнейм не может быть пустым')
      return
    }
    
    if (nickname.length > 20) {
      toast.error('Никнейм не может быть длиннее 20 символов')
      return
    }
    
    setSaving(true)
    try {
      const response = await apiClient.updateProfile({
        nickname: nickname.trim(),
      })
      if (response.success) {
        setProfile({ ...profile, nickname: nickname.trim(), displayName: nickname.trim() })
        setEditingNickname(false)
        toast.success('Никнейм обновлен')
      } else {
        throw new Error(response.error || 'Ошибка обновления')
      }
    } catch (error: any) {
      console.error('Error updating nickname:', error)
      toast.error(error.message || 'Ошибка обновления никнейма')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !profile || !e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    
    // Проверяем размер файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 2MB')
      return
    }
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение')
      return
    }
    
    setUploadingAvatar(true)
    try {
      // Загружаем через C# API
      const response = await apiClient.uploadAvatar(file)
      
      if (response.success && response.data?.url) {
        const originalUrl = response.data.url
        // Сохраняем оригинальный URL в БД (без /api/backend)
        // Для отображения будем добавлять /api/backend при загрузке
        
        // Обновляем профиль с оригинальным URL
        const updateResponse = await apiClient.updateProfile({
          avatar: originalUrl, // Сохраняем оригинальный путь
        })
        
        if (updateResponse.success) {
          // Для отображения используем URL через прокси
          const displayUrl = originalUrl.startsWith('/uploads/') 
            ? `/api/backend${originalUrl}` 
            : originalUrl
          setProfile({ ...profile, avatar: displayUrl })
          toast.success('Аватарка обновлена')
        } else {
          throw new Error(updateResponse.error || 'Ошибка сохранения аватарки')
        }
      } else {
        throw new Error(response.error || 'Ошибка загрузки аватарки')
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.message || 'Ошибка загрузки аватарки')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const handlePrivacyChange = async (key: 'showActivity' | 'showAchievements' | 'showProfile', value: boolean) => {
    if (!user || !profile) return
    
    try {
      // Обновляем через API (если бэкенд поддерживает privacy настройки)
      // Пока просто обновляем локально
      setProfile({
        ...profile,
        privacy: {
          showActivity: profile.privacy?.showActivity ?? true,
          showAchievements: profile.privacy?.showAchievements ?? true,
          showProfile: profile.privacy?.showProfile ?? true,
          [key]: value,
        } as { showActivity: boolean; showAchievements: boolean; showProfile: boolean },
      })
      toast.success('Настройки приватности обновлены')
    } catch (error) {
      console.error('Error updating privacy:', error)
      toast.error('Ошибка обновления настроек')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Вы успешно вышли')
      window.location.href = '/'
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Ошибка при выходе')
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Профиль</h1>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Информация о пользователе
                </CardTitle>
                <CardDescription>Ваши данные профиля</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative group">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/50">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.nickname} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Если изображение не загрузилось, показываем иконку
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent && !parent.querySelector('.fallback-icon')) {
                              const icon = document.createElement('div')
                              icon.className = 'fallback-icon w-full h-full flex items-center justify-center'
                              icon.innerHTML = '<svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
                              parent.appendChild(icon)
                            }
                          }}
                        />
                      ) : (
                        <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Upload className="h-5 w-5 text-white" />
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingNickname ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="max-w-[200px]"
                          placeholder="Никнейм"
                          maxLength={20}
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveNickname}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNickname(false)
                            setNickname(profile.nickname)
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg sm:text-xl truncate">{profile.nickname || 'Пользователь'}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingNickname(true)}
                          className="h-6 w-6"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      {user.email}
                    </p>
                    {userRole && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Роль: {userRole === 'admin' ? 'Администратор' : 'Пользователь'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Просмотрено проектов</p>
                    <p className="text-lg font-semibold">{profile.stats?.projectsViewed || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Прочитано статей</p>
                    <p className="text-lg font-semibold">{profile.stats?.blogPostsRead || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Запусков кода</p>
                    <p className="text-lg font-semibold">{profile.stats?.codeRuns || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <button
                    onClick={() => setShowFollowingModal(true)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <UserPlus className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Подписки</p>
                      <p className="text-lg font-semibold">{followingCount}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Подписчики</p>
                      <p className="text-lg font-semibold">{followersCount}</p>
                    </div>
                  </button>
                </div>

                {('metadata' in user && user.metadata?.creationTime) && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Дата регистрации
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.metadata.creationTime).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Достижения
                </CardTitle>
                <CardDescription>
                  Получено: {profile.achievements?.length || 0} из {ACHIEVEMENTS.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ACHIEVEMENTS.map((achievement) => {
                    const unlocked = profile.achievements?.includes(achievement.id) || false
                    return (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={unlocked}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Настройки приватности
                </CardTitle>
                <CardDescription>
                  Управляйте видимостью вашей активности на сайте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-activity" className="flex items-center gap-2">
                      {profile.privacy?.showActivity ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      Показывать подписчиков и подписки
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Другие пользователи могут видеть ваших подписчиков и подписки
                    </p>
                  </div>
                  <Switch
                    id="show-activity"
                    checked={profile.privacy?.showActivity ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-achievements" className="flex items-center gap-2">
                      {profile.privacy?.showAchievements ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      Показывать достижения
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Другие пользователи могут видеть ваши достижения
                    </p>
                  </div>
                  <Switch
                    id="show-achievements"
                    checked={profile.privacy?.showAchievements ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showAchievements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-profile" className="flex items-center gap-2">
                      {profile.privacy?.showProfile ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      Публичный профиль
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Другие пользователи могут просматривать ваш профиль
                    </p>
                  </div>
                  <Switch
                    id="show-profile"
                    checked={profile.privacy?.showProfile ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showProfile', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Действия</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Выйти из аккаунта
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

