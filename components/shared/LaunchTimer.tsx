'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
// Проекты загружаются через C# API

// Дата запуска сайта: 05.12.2025 11:32
const LAUNCH_DATE = new Date('2025-12-05T11:32:00').getTime()

interface TimeUnits {
  years: number
  months: number
  weeks: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function LaunchTimer() {
  const [time, setTime] = useState<TimeUnits>({
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [projectsCount, setProjectsCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const calculateTime = () => {
      const now = Date.now()
      const diff = now - LAUNCH_DATE

      if (diff < 0) {
        // Если текущее время меньше даты запуска, показываем нули
        setTime({
          years: 0,
          months: 0,
          weeks: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
        return
      }

      const launchDate = new Date(LAUNCH_DATE)
      const currentDate = new Date(now)
      
      // Вычисляем годы и месяцы через разницу дат
      let years = currentDate.getFullYear() - launchDate.getFullYear()
      let months = currentDate.getMonth() - launchDate.getMonth()
      
      if (months < 0) {
        years--
        months += 12
      }
      
      // Проверяем, прошла ли дата в текущем месяце
      if (currentDate.getDate() < launchDate.getDate()) {
        months--
        if (months < 0) {
          years--
          months += 12
        }
      }

      // Вычисляем оставшееся время после учета лет и месяцев
      const adjustedLaunchDate = new Date(launchDate)
      adjustedLaunchDate.setFullYear(adjustedLaunchDate.getFullYear() + years)
      adjustedLaunchDate.setMonth(adjustedLaunchDate.getMonth() + months)
      
      const remainingDiff = now - adjustedLaunchDate.getTime()
      
      // Вычисляем недели, дни, часы, минуты, секунды
      const totalSeconds = Math.floor(remainingDiff / 1000)
      const totalMinutes = Math.floor(totalSeconds / 60)
      const totalHours = Math.floor(totalMinutes / 60)
      const totalDays = Math.floor(totalHours / 24)
      const totalWeeks = Math.floor(totalDays / 7)

      setTime({
        years: Math.max(0, years),
        months: Math.max(0, months),
        weeks: totalWeeks,
        days: totalDays % 7,
        hours: totalHours % 24,
        minutes: totalMinutes % 60,
        seconds: totalSeconds % 60,
      })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    
    const loadProjectsCount = async () => {
      try {
        const { apiClient } = await import('@/lib/api/client')
        const response = await apiClient.getProjects()
        if (response.success && response.data) {
          setProjectsCount(response.data.length)
        }
      } catch (error) {
        console.error('Error loading projects count:', error)
      }
    }

    loadProjectsCount()
    
    // Polling для обновления каждые 30 секунд
    const interval = setInterval(loadProjectsCount, 30000)
    return () => clearInterval(interval)
  }, [mounted])

  const TimeUnit = ({ value, label, color, gradient }: { value: number; label: string; color: string; gradient: string }) => (
    <Card className="p-3 md:p-4 lg:p-5 xl:p-6 text-center border-2 border-border/30 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md hover:border-primary/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 relative overflow-visible group min-h-[100px] md:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-2 ${gradient} drop-shadow-2xl leading-none`} style={{
          textShadow: '0 0 15px currentColor, 0 0 30px currentColor',
          lineHeight: '1',
          wordBreak: 'keep-all',
          overflow: 'visible'
        }}>
          {String(value).padStart(2, '0')}
        </div>
        <div className="text-[10px] md:text-xs lg:text-sm xl:text-base text-muted-foreground font-bold uppercase tracking-wider mt-1">
          {label}
        </div>
      </div>
    </Card>
  )

  if (!mounted) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Сайт работает
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground/80 mb-4">
            Запущен: <span className="font-semibold text-primary">05.12.2025 11:32</span>
          </p>
          <div className="inline-block">
            <Card className="p-4 md:p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md">
              <div className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent" style={{
                  textShadow: '0 0 15px currentColor, 0 0 30px currentColor',
                  lineHeight: '1',
                }}>
                  0
                </div>
                <div className="text-sm md:text-base lg:text-lg text-muted-foreground font-bold uppercase tracking-wider">
                  Завершенных проектов
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 lg:gap-4 xl:gap-5">
          {[0, 0, 0, 0, 0, 0, 0].map((_, i) => (
            <Card key={i} className="p-3 md:p-4 lg:p-5 xl:p-6 text-center border-2 border-border/30 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md min-h-[100px] md:min-h-[120px] lg:min-h-[140px] flex flex-col justify-center">
              <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-2 leading-none">00</div>
              <div className="text-[10px] md:text-xs lg:text-sm xl:text-base text-muted-foreground font-bold uppercase tracking-wider mt-1">...</div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
      <div className="mb-8 md:mb-12 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Сайт работает
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground/80 mb-4">
          Запущен: <span className="font-semibold text-primary">05.12.2025 11:32</span>
        </p>
        <div className="inline-block">
          <Card className="p-4 md:p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-md">
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent" style={{
                textShadow: '0 0 15px currentColor, 0 0 30px currentColor',
                lineHeight: '1',
              }}>
                {projectsCount}
              </div>
              <div className="text-sm md:text-base lg:text-lg text-muted-foreground font-bold uppercase tracking-wider">
                Завершенных проектов
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3 lg:gap-4 xl:gap-5">
        <TimeUnit 
          value={time.years} 
          label="Лет" 
          color="text-blue-400" 
          gradient="bg-gradient-to-br from-blue-400 to-cyan-500 bg-clip-text text-transparent" 
        />
        <TimeUnit 
          value={time.months} 
          label="Месяцев" 
          color="text-purple-400" 
          gradient="bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-transparent" 
        />
        <TimeUnit 
          value={time.weeks} 
          label="Недель" 
          color="text-pink-400" 
          gradient="bg-gradient-to-br from-pink-400 to-rose-500 bg-clip-text text-transparent" 
        />
        <TimeUnit 
          value={time.days} 
          label="Дней" 
          color="text-green-400" 
          gradient="bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent" 
        />
        <TimeUnit 
          value={time.hours} 
          label="Часов" 
          color="text-yellow-400" 
          gradient="bg-gradient-to-br from-yellow-400 to-amber-500 bg-clip-text text-transparent" 
        />
        <TimeUnit 
          value={time.minutes} 
          label="Минут" 
          color="text-orange-400" 
          gradient="bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent" 
        />
        <TimeUnit 
          value={time.seconds} 
          label="Секунд" 
          color="text-red-400" 
          gradient="bg-gradient-to-br from-red-400 to-pink-500 bg-clip-text text-transparent" 
        />
      </div>
    </div>
  )
}

