'use client'

import { Button } from '@/components/ui/button'
import { Share2, MessageCircle, Mail, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareButtonsProps {
  title: string
  url: string
  description?: string
}

export default function ShareButtons({ title, url, description }: ShareButtonsProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
  const shareText = `${title}${description ? ` - ${description}` : ''}`

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(fullUrl)
    const encodedText = encodeURIComponent(shareText)

    let shareUrl = ''

    switch (platform) {
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        break
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(fullUrl)
          toast.success('Ссылка скопирована!')
          return
        } catch (err) {
          toast.error('Не удалось скопировать')
          return
        }
      case 'native':
        try {
          if (navigator.share) {
            await navigator.share({
              title,
              text: description || '',
              url: fullUrl
            })
            return
          } else {
            // Fallback для браузеров без нативного шаринга
            await navigator.clipboard.writeText(fullUrl)
            toast.success('Ссылка скопирована!')
            return
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            toast.error('Ошибка при шаринге')
          }
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const hasNativeShare = typeof window !== 'undefined' && 'share' in navigator

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {/* Нативный шаринг для мобильных */}
      {hasNativeShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('native')}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Поделиться</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('telegram')}
        className="flex items-center gap-2"
        title="Telegram"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden md:inline">Telegram</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="flex items-center gap-2"
        title="WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden md:inline">WhatsApp</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('vk')}
        className="flex items-center gap-2"
        title="ВКонтакте"
      >
        <span className="text-sm font-bold">VK</span>
        <span className="hidden md:inline ml-1">ВКонтакте</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('email')}
        className="flex items-center gap-2"
        title="Email"
      >
        <Mail className="h-4 w-4" />
        <span className="hidden md:inline">Email</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="flex items-center gap-2"
        title="Копировать ссылку"
      >
        <Link2 className="h-4 w-4" />
        <span className="hidden md:inline">Копировать</span>
      </Button>
    </div>
  )
}

