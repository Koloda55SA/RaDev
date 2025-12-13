'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Type } from 'lucide-react'

type FontSize = 'small' | 'normal' | 'large' | 'xlarge'

export default function FontSizeControl() {
  const [fontSize, setFontSize] = useState<FontSize>('normal')

  useEffect(() => {
    // Загружаем сохраненный размер из localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fontSize') as FontSize
      if (saved && ['small', 'normal', 'large', 'xlarge'].includes(saved)) {
        setFontSize(saved)
        applyFontSize(saved)
      }
    }
  }, [])

  const applyFontSize = (size: FontSize) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge')
      document.documentElement.classList.add(`font-size-${size}`)
    }
  }

  const handleFontSizeChange = (newSize: FontSize) => {
    setFontSize(newSize)
    applyFontSize(newSize)
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', newSize)
    }
  }

  const decrease = () => {
    const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      handleFontSizeChange(sizes[currentIndex - 1])
    }
  }

  const increase = () => {
    const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      handleFontSizeChange(sizes[currentIndex + 1])
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={decrease}
        disabled={fontSize === 'small'}
        title="Уменьшить шрифт"
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Размер шрифта"
        className="h-8 w-8"
        disabled
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={increase}
        disabled={fontSize === 'xlarge'}
        title="Увеличить шрифт"
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}








