'use client'

import { useRef } from 'react'
import { TouchEvent as ReactTouchEvent } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  minDistance?: number
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  minDistance = 30,
}: SwipeHandlers) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  const minSwipeDistance = minDistance

  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const onTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isUpSwipe = distanceY > minSwipeDistance
    const isDownSwipe = distanceY < -minSwipeDistance

    if (isLeftSwipe && Math.abs(distanceX) > Math.abs(distanceY) && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && Math.abs(distanceX) > Math.abs(distanceY) && onSwipeRight) {
      onSwipeRight()
    }
    if (isUpSwipe && Math.abs(distanceY) > Math.abs(distanceX) && onSwipeUp) {
      onSwipeUp()
    }
    if (isDownSwipe && Math.abs(distanceY) > Math.abs(distanceX) && onSwipeDown) {
      onSwipeDown()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
