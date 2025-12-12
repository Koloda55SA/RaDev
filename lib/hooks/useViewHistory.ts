'use client'

import { useState, useEffect } from 'react'

export function useViewHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewHistory')
      if (saved) {
        try {
          setHistory(JSON.parse(saved))
        } catch (e) {
          console.error('Error parsing view history:', e)
        }
      }
    }
  }, [])

  const addToHistory = (itemId: string, type: 'project' | 'blog') => {
    if (typeof window === 'undefined') return
    const key = `${type}:${itemId}`
    setHistory(prev => {
      const filtered = prev.filter(id => id !== key)
      const newHistory = [key, ...filtered].slice(0, 20) // Храним последние 20
      localStorage.setItem('viewHistory', JSON.stringify(newHistory))
      return newHistory
    })
  }

  const getHistory = (type?: 'project' | 'blog') => {
    if (type) {
      return history.filter(id => id.startsWith(`${type}:`)).map(id => id.split(':')[1])
    }
    return history.map(id => id.split(':')[1])
  }

  const clearHistory = () => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('viewHistory')
    }
  }

  return { history, addToHistory, getHistory, clearHistory }
}

