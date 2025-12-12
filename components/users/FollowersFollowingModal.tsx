'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserSubscription, getFollowingList, getFollowersList } from '@/lib/api/socialApi'
import { useRouter } from 'next/navigation'
import { User, UserPlus, UserMinus } from 'lucide-react'
import Image from 'next/image'

interface FollowersFollowingModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: 'followers' | 'following'
}

export default function FollowersFollowingModal({ 
  userId, 
  open, 
  onOpenChange, 
  initialTab = 'followers' 
}: FollowersFollowingModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const [followers, setFollowers] = useState<UserSubscription[]>([])
  const [following, setFollowing] = useState<UserSubscription[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [followersList, followingList] = await Promise.all([
        getFollowersList(userId),
        getFollowingList(userId)
      ])
      setFollowers(followersList)
      setFollowing(followingList)
    } catch (error) {
      console.error('Error loading followers/following:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (targetUserId: string) => {
    onOpenChange(false)
    router.push(`/users/${targetUserId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Подписчики и подписки</DialogTitle>
          <DialogDescription>
            Просмотр списка подписчиков и подписок
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'followers' | 'following')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Подписчики ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Подписки ({following.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="flex-1 overflow-y-auto mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет подписчиков</div>
            ) : (
              followers.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => handleUserClick(user.uid)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.nickname}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="following" className="flex-1 overflow-y-auto mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : following.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет подписок</div>
            ) : (
              following.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => handleUserClick(user.uid)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.nickname}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

