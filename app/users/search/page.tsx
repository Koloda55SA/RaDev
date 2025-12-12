'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/useAuth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserPlus, UserMinus, Ban, MessageCircle, User } from 'lucide-react'
import { searchUsersByNickname, followUser, unfollowUser, getUserById, blockUser, UserSubscription } from '@/lib/api/socialApi'
import { apiClient } from '@/lib/api/client'
import { escapeHtml } from '@/lib/utils/security'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function UserSearchPage() {
  const { user } = useAuth()
  const router = useRouter()
  const navigate = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<UserSubscription[]>([])
  const [searching, setSearching] = useState(false)
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({})
  const [blockedStatus, setBlockedStatus] = useState<Record<string, boolean>>({})
  const [suggestions, setSuggestions] = useState<UserSubscription[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/users/search')
      return
    }
  }, [user, router])

  // Автодополнение при вводе
  useEffect(() => {
    if (!user || !searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const userId = ('uid' in user ? user.uid : user.id) || ''
        if (!userId) return
        const searchResults = await searchUsersByNickname(searchQuery, userId)
        setSuggestions(searchResults)
      } catch (error) {
        console.error('Error getting suggestions:', error)
      }
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, user])

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return
    
    setSearching(true)
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      const searchResults = await searchUsersByNickname(searchQuery, userId)
      setResults(searchResults)
      
      // Проверяем статус подписки для каждого результата
      const statuses: Record<string, boolean> = {}
      
      // Получаем список подписок текущего пользователя
      const followingResponse = await apiClient.getFollowing()
      const followingList = followingResponse.success ? followingResponse.data || [] : []
      const followingIds = new Set(followingList.map((u: any) => u.id || u.userId))
      
      for (const result of searchResults) {
        statuses[result.uid] = followingIds.has(result.uid)
      }
      
      setFollowingStatus(statuses)
      setBlockedStatus({}) // Блокировка пока не реализована в C# API
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Ошибка поиска пользователей')
    } finally {
      setSearching(false)
    }
  }

  const handleFollow = async (targetUser: UserSubscription) => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await followUser(userId, targetUser.uid)
      setFollowingStatus(prev => ({ ...prev, [targetUser.uid]: true }))
      toast.success(`Подписались на ${targetUser.nickname}`)
    } catch (error: any) {
      console.error('Error following user:', error)
      toast.error(error.message || 'Ошибка подписки')
    }
  }

  const handleUnfollow = async (targetUser: UserSubscription) => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await unfollowUser(userId, targetUser.uid)
      setFollowingStatus(prev => ({ ...prev, [targetUser.uid]: false }))
      toast.success(`Отписались от ${targetUser.nickname}`)
    } catch (error: any) {
      console.error('Error unfollowing user:', error)
      toast.error('Ошибка отписки')
    }
  }

  const handleBlock = async (targetUser: UserSubscription) => {
    if (!user) return
    
    if (!confirm(`Заблокировать ${targetUser.nickname}? Вы не сможете писать друг другу.`)) {
      return
    }
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await blockUser(userId, targetUser.uid)
      setBlockedStatus(prev => ({ ...prev, [targetUser.uid]: true }))
      setFollowingStatus(prev => ({ ...prev, [targetUser.uid]: false }))
      toast.success(`${targetUser.nickname} заблокирован`)
    } catch (error: any) {
      console.error('Error blocking user:', error)
      toast.error(error.message || 'Ошибка блокировки')
    }
  }

  const handleStartChat = (targetUser: UserSubscription) => {
    router.push(`/chat?user=${targetUser.uid}`)
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </Link>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Поиск пользователей</h1>
        <p className="text-muted-foreground">Найдите друзей по никнейму</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Введите никнейм пользователя..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  className="w-full"
                />
                {suggestions.length > 0 && searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.uid}
                        onClick={() => {
                          setSearchQuery(suggestion.nickname)
                          setSuggestions([])
                          handleSearch()
                        }}
                        className="w-full text-left p-3 hover:bg-secondary transition-colors flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {suggestion.avatar ? (
                            <img src={suggestion.avatar} alt={suggestion.nickname} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{escapeHtml(suggestion.nickname)}</p>
                          <p className="text-xs text-muted-foreground truncate">{escapeHtml(suggestion.email)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                <Search className="h-4 w-4 mr-2" />
                {searching ? 'Поиск...' : 'Найти'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Результаты поиска ({results.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => {
              const isFollowingUser = followingStatus[result.uid] || false
              const isBlockedUser = blockedStatus[result.uid] || false
              
              return (
                <Card key={result.uid} className={isBlockedUser ? 'opacity-50' : ''}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                        {result.avatar ? (
                          <img src={result.avatar} alt={result.nickname} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{escapeHtml(result.nickname)}</CardTitle>
                        <CardDescription className="truncate">{escapeHtml(result.email)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isBlockedUser ? (
                      <p className="text-sm text-muted-foreground">Пользователь заблокирован</p>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          {isFollowingUser ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfollow(result)}
                              className="flex-1"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Отписаться
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleFollow(result)}
                              className="flex-1"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Подписаться
                            </Button>
                          )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartChat(result)}
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Написать
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/users/${result.uid}`)}
                          className="flex-1"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Профиль
                        </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBlock(result)}
                          className="w-full"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Заблокировать
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {results.length === 0 && searchQuery && !searching && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Пользователи не найдены</p>
            <p className="text-sm mt-2">Попробуйте изменить запрос</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


