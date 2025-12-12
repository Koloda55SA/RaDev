'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

interface AchievementModalProps {
  open: boolean
  onClose: () => void
  achievement: {
    icon: string
    name: string
    description: string
  }
}

export default function AchievementModal({ open, onClose, achievement }: AchievementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 Достижение разблокировано!</DialogTitle>
          <DialogDescription className="text-center">
            Поздравляем с новым достижением!
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-8"
        >
          <div className="text-8xl mb-4 animate-bounce">
            {achievement.icon}
          </div>
          <h3 className="text-2xl font-bold mb-2 text-center">{achievement.name}</h3>
          <p className="text-muted-foreground text-center">{achievement.description}</p>
          <div className="mt-6 flex items-center gap-2 text-yellow-500">
            <Trophy className="h-6 w-6" />
            <span className="font-semibold">Достижение добавлено в ваш профиль!</span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}








