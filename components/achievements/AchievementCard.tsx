'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Achievement } from '@/lib/achievements'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface AchievementCardProps {
  achievement: Achievement
  unlocked: boolean
  onView?: () => void
}

export default function AchievementCard({ achievement, unlocked, onView }: AchievementCardProps) {
  // Генерируем URL изображения достижения
  const imageUrl = `/achievements/${achievement.id}.png`
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      className="cursor-pointer"
      onClick={onView}
    >
      <Card
        className={`relative overflow-hidden transition-all ${
          unlocked
            ? 'border-primary/50 bg-primary/5 shadow-md hover:shadow-lg'
            : 'border-muted bg-muted/30 opacity-60 grayscale'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              {unlocked ? (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg blur-sm" />
                  <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-3xl sm:text-4xl shadow-lg">
                    {achievement.icon}
                  </div>
                  {unlocked && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center text-3xl sm:text-4xl opacity-50">
                  {achievement.icon}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-base sm:text-lg mb-1 ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {achievement.name}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>
              {unlocked && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Разблокировано</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}








