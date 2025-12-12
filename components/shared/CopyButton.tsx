'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  size?: 'sm' | 'lg' | 'icon'
}

export default function CopyButton({ text, label, className, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Скопировано!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Ошибка копирования')
    }
  }

  if (size === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className={className}
        title="Копировать"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Скопировано
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {label || 'Копировать'}
        </>
      )}
    </Button>
  )
}
