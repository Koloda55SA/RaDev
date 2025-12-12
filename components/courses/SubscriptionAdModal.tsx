'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Instagram, Send } from 'lucide-react'

interface SubscriptionAdModalProps {
  open: boolean
  onClose: () => void
}

export default function SubscriptionAdModal({ open, onClose }: SubscriptionAdModalProps) {
  const handleTelegramClick = () => {
    window.open('https://t.me/radev_digital', '_blank')
  }

  const handleInstagramClick = () => {
    window.open('https://instagram.com/radev_digital', '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">🎉 Поздравляем!</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base pt-2">
            Вы успешно завершили курс! Подписывайтесь на наши соцсети, чтобы не пропустить новые курсы и обновления.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button
            onClick={handleTelegramClick}
            className="w-full bg-[#0088cc] hover:bg-[#006699] text-white"
            size="lg"
          >
            <Send className="h-5 w-5 mr-2" />
            Подписаться на Telegram
          </Button>
          <Button
            onClick={handleInstagramClick}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            size="lg"
          >
            <Instagram className="h-5 w-5 mr-2" />
            Подписаться на Instagram
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}






