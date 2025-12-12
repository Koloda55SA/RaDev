'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Симуляция загрузки
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 300)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Минимальное время показа загрузки (1 секунда)
    setTimeout(() => {
      if (progress >= 100) {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Image
                src="/logo.png"
                alt="R&A-Dev"
                width={120}
                height={120}
                className="object-contain"
                priority
              />
            </motion.div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 glow-blue">R&A-Dev</h2>
              <p className="text-muted-foreground text-sm">Первый сайт в Кыргызстане для бесплатного обучения программированию</p>
            </div>
            <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

