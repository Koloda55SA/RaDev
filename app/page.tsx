'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Code, Users, Award, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import StatsSection from '@/components/shared/StatsSection'
import OrderProjectModal from '@/components/shared/OrderProjectModal'

// Lazy load тяжелых компонентов
const LaunchTimer = dynamic(() => import('@/components/shared/LaunchTimer'), {
  ssr: false,
  loading: () => <div className="h-16" />,
})

const ParticleBackground = dynamic(() => import('@/components/shared/ParticleBackground'), {
  ssr: false,
  loading: () => null,
})

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="mb-8 w-full">
          <LaunchTimer />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
          <Image src="/logo.png" alt="R&A-Dev" width={96} height={96} className="h-16 w-16 md:h-24 md:w-24 object-contain" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold glow-blue text-center">
            R&A-Dev
          </h1>
        </div>
        
        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 text-primary font-bold text-center px-4">
          Первый сайт в Кыргызстане для бесплатного обучения программированию
        </p>
        
        <p className="text-base sm:text-lg md:text-xl mb-4 max-w-3xl text-muted-foreground text-center px-4">
          Изучайте программирование с нуля до профессионала. Python, JavaScript, Java, C++, C# - все курсы полностью бесплатны!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/courses">
            <Button size="lg" variant="neon" className="group">
              <BookOpen className="mr-2 h-5 w-5" />
              Начать обучение
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="group">
              О сайте
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <OrderProjectModal />
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 glow-purple">Что такое R&A-Dev?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            R&A-Dev - это образовательная платформа для изучения программирования. 
            Мы предлагаем полноценные курсы по 5 языкам программирования с теорией, практикой и тестами.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card/50">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-4 glow-blue">Полные курсы</h3>
            <p className="text-muted-foreground mb-4">
              5 языков программирования: Python, JavaScript, Java, C++, C#. Каждый курс от 0 до 100% с уникальным контентом.
            </p>
            <Link href="/courses" className="text-sm text-primary hover:underline">Начать обучение →</Link>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card/50">
            <Code className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-4 glow-green">Практика и тесты</h3>
            <p className="text-muted-foreground mb-4">
              Интерактивный редактор кода, автоматическая проверка решений, тестовые задания для каждого урока.
            </p>
            <Link href="/courses" className="text-sm text-primary hover:underline">Попробовать →</Link>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card/50">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-4 glow-purple">Сообщество</h3>
            <p className="text-muted-foreground mb-4">
              Общайтесь с другими студентами, делитесь достижениями, следите за прогрессом друзей.
            </p>
            <Link href="/users/search" className="text-sm text-primary hover:underline">Найти друзей →</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center glow-blue">Почему R&A-Dev?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card/50">
            <Award className="h-8 w-8 mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">Полностью бесплатно</h3>
            <p className="text-muted-foreground">
              Все курсы, уроки и материалы доступны абсолютно бесплатно. Никаких скрытых платежей.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card/50">
            <Zap className="h-8 w-8 mb-4 text-blue-500" />
            <h3 className="text-xl font-bold mb-2">От нуля до профессионала</h3>
            <p className="text-muted-foreground">
              Прогрессивная сложность. Начните с основ и постепенно переходите к продвинутым темам.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-border hover:border-primary transition-colors bg-card/50">
            <Code className="h-8 w-8 mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2">Практика в браузере</h3>
            <p className="text-muted-foreground">
              Не нужно устанавливать ничего. Пишите и запускайте код прямо в браузере.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />
    </div>
  )
}
