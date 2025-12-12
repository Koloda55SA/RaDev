'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Eye, Heart, MessageCircle } from 'lucide-react'
import { useViewHistory } from '@/lib/hooks/useViewHistory'
import { useFavorites } from '@/lib/hooks/useFavorites'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  condition: () => boolean
  unlocked: boolean
}

export default function Achievements() {
  const { history } = useViewHistory()
  const { getFavorites } = useFavorites()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const favorites = getFavorites()
    const viewedProjects = history.filter(id => id.startsWith('project:')).length
    const viewedBlogs = history.filter(id => id.startsWith('blog:')).length

    const allAchievements: Achievement[] = [
      {
        id: 'first_view',
        name: 'Первый шаг',
        description: 'Просмотрен первый проект',
        icon: <Eye className="h-5 w-5" />,
        condition: () => viewedProjects >= 1,
        unlocked: false,
      },
      {
        id: 'explorer',
        name: 'Исследователь',
        description: 'Просмотрено 10 проектов',
        icon: <Eye className="h-5 w-5" />,
        condition: () => viewedProjects >= 10,
        unlocked: false,
      },
      {
        id: 'collector',
        name: 'Коллекционер',
        description: 'Добавлено 5 проектов в избранное',
        icon: <Star className="h-5 w-5" />,
        condition: () => favorites.length >= 5,
        unlocked: false,
      },
      {
        id: 'reader',
        name: 'Читатель',
        description: 'Прочитано 5 статей блога',
        icon: <MessageCircle className="h-5 w-5" />,
        condition: () => viewedBlogs >= 5,
        unlocked: false,
      },
    ]

    const unlocked = allAchievements.map(ach => ({
      ...ach,
      unlocked: ach.condition(),
    }))

    setAchievements(unlocked)
  }, [history, getFavorites, mounted])

  if (!mounted) return null

  const unlockedCount = achievements.filter(a => a.unlocked).length

  if (unlockedCount === 0) return null

  return (
    <div className="mb-6" style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
      <Card style={{ pointerEvents: 'auto' }}>
        <CardHeader style={{ pointerEvents: 'auto' }}>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Достижения ({unlockedCount}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ pointerEvents: 'auto' }}>
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-border opacity-50'
                }`}
                style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {achievement.icon}
                  <span className="font-semibold text-sm">{achievement.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {achievement.unlocked && (
                  <Badge className="mt-2 bg-yellow-500">Разблокировано</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
