'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, X } from 'lucide-react'

export default function ReadingMode() {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Проверяем сохраненное состояние
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('readingMode') === 'true'
      setIsActive(saved)
      if (saved) {
        document.body.classList.add('reading-mode')
      }
    }
  }, [])

  const toggleReadingMode = () => {
    const newState = !isActive
    setIsActive(newState)
    
    if (typeof window !== 'undefined') {
      if (newState) {
        document.body.classList.add('reading-mode')
        localStorage.setItem('readingMode', 'true')
      } else {
        document.body.classList.remove('reading-mode')
        localStorage.setItem('readingMode', 'false')
      }
    }
  }

  if (isActive) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={toggleReadingMode}
        title="Выйти из режима чтения"
        className="bg-primary hover:bg-primary/90"
      >
        <X className="h-4 w-4 mr-2" />
        Выйти из режима чтения
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleReadingMode}
      title="Режим чтения"
      className="h-8 w-8"
    >
      <BookOpen className="h-4 w-4" />
    </Button>
  )
}
