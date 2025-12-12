'use client'

import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites')
      if (saved) {
        try {
          setFavorites(new Set(JSON.parse(saved)))
        } catch (e) {
          console.error('Error parsing favorites:', e)
        }
      }
    }
  }, [])

  const toggleFavorite = (id: string, type: 'project' | 'blog' = 'project') => {
    if (typeof window === 'undefined') return
    const key = type === 'blog' ? `blog:${id}` : id
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(key)) {
        newFavorites.delete(key)
      } else {
        newFavorites.add(key)
      }
      localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)))
      return newFavorites
    })
  }

  const removeFavorite = (id: string, type: 'project' | 'blog' = 'project') => {
    if (typeof window === 'undefined') return
    const key = type === 'blog' ? `blog:${id}` : id
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      newFavorites.delete(key)
      localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)))
      return newFavorites
    })
  }

  const isFavorite = (id: string, type: 'project' | 'blog' = 'project') => {
    const key = type === 'blog' ? `blog:${id}` : id
    return favorites.has(key)
  }

  const getFavorites = () => Array.from(favorites)

  const clearFavorites = () => {
    setFavorites(new Set())
    if (typeof window !== 'undefined') {
      localStorage.removeItem('favorites')
    }
  }

  return { favorites, toggleFavorite, removeFavorite, isFavorite, getFavorites, clearFavorites }
}
