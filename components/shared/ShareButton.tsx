'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareButtonProps {
  url: string
  title?: string
  text?: string
  className?: string
  size?: 'sm' | 'lg' | 'icon'
}

export default function ShareButton({ url, title, text, className, size = 'sm' }: ShareButtonProps) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: title || 'R&A-Dev',
      text: text || '',
      url: url,
    }

    // Используем нативный Share API если доступен (мобильные)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } catch (error: any) {
        // Пользователь отменил или ошибка - используем fallback
        if (error.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      // Fallback для десктопа - копируем ссылку
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Ссылка скопирована!')
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (error) {
      toast.error('Ошибка копирования')
    }
  }

  if (size === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        className={className}
        title="Поделиться"
      >
        {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleShare}
      className={className}
    >
      {shared ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Скопировано
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Поделиться
        </>
      )}
    </Button>
  )
}
