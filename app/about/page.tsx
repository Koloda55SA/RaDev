'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Linkedin, Mail, Code, Users, Clock, MessageCircle, BookOpen, Globe, Smartphone, Heart } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-blue">
          О сайте R&A-Dev
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4">
          Многофункциональная платформа для IT-специалистов
        </p>
        <p className="text-sm sm:text-base text-muted-foreground/80 max-w-2xl mx-auto">
          <span className="font-semibold">R&A-Dev</span> = <span className="text-primary">Р</span>ахманов Сыймыкбек + <span className="text-primary">А</span>бдырахманов Абдыкадыр
        </p>
      </div>

      {/* Основные функции */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <CardTitle>Обучение программированию</CardTitle>
            </div>
            <CardDescription>
              Бесплатные курсы по 5 языкам программирования
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Python, JavaScript, Java, C++, C#</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Интерактивные уроки с практикой</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Автоматическая проверка кода</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Отслеживание прогресса</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Globe className="h-8 w-8 text-green-500" />
              <CardTitle>Разработка сайтов</CardTitle>
            </div>
            <CardDescription>
              Профессиональная разработка веб-сайтов на заказ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Landing Page от 5000 сом</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Корпоративные сайты от 15000 сом</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Интернет-магазины от 30000 сом</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Современные технологии React, Next.js</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <CardTitle>Социальная сеть</CardTitle>
            </div>
            <CardDescription>
              Социальная платформа для IT-специалистов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Обмен сообщениями с кодом и фото</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Подписки и подписчики</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Достижения и прогресс</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Поиск пользователей</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Подробное описание */}
      <div className="max-w-4xl mx-auto space-y-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Образовательная платформа
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              R&A-Dev предлагает бесплатные курсы программирования для всех желающих. 
              Вы можете изучать Python, JavaScript, Java, C++ и C# с нуля до продвинутого уровня.
            </p>
            <p className="text-muted-foreground mb-4">
              Каждый курс включает теорию, практические задания с автоматической проверкой, 
              тесты и отслеживание прогресса. Все материалы доступны бесплатно.
            </p>
            <Link href="/courses">
              <span className="text-primary hover:underline cursor-pointer">Начать обучение →</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-green-500" />
              Разработка на заказ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Команда R&A-Dev занимается профессиональной разработкой веб-сайтов, 
              мобильных приложений и дипломных работ на заказ.
            </p>
            <p className="text-muted-foreground mb-4">
              Мы создаем современные решения с использованием актуальных технологий: 
              React, Next.js, Node.js, Python, React Native, Flutter и других.
            </p>
            <div className="flex gap-4">
              <Link href="/contacts">
                <span className="text-primary hover:underline cursor-pointer">Связаться с нами →</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-500" />
              Социальная сеть для IT-специалистов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              R&A-Dev - это не только образовательная платформа, но и социальная сеть 
              для программистов и IT-специалистов.
            </p>
            <p className="text-muted-foreground mb-4">
              Вы можете общаться с другими пользователями, обмениваться сообщениями с кодом и фотографиями, 
              подписываться на интересных людей, просматривать их достижения и прогресс в обучении.
            </p>
            <p className="text-muted-foreground mb-4">
              Система приватности позволяет контролировать, кто может видеть ваши достижения, 
              подписчиков и активность.
            </p>
            <Link href="/users/search">
              <span className="text-primary hover:underline cursor-pointer">Найти пользователей →</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Разработчики */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Разработчики</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:border-primary transition-colors border-2 border-neon-blue">
            <CardHeader>
              <CardTitle className="text-2xl glow-blue">
                Сыймыкбек Рахманов
                <span className="ml-2 text-sm text-neon-blue">⭐</span>
              </CardTitle>
              <CardDescription className="text-lg">Главный разработчик • Fullstack Developer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Опыт: 2 года</p>
                <p className="text-sm text-muted-foreground">
                  Опытный разработчик с 2 годами опыта. Исправляет ошибки и наставляет Абдыкадыра.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Навыки
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'Node.js', 'Python', 'TypeScript', 'Firebase'].map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-secondary text-sm border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-border">
                <a href="https://github.com/syyimyk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a href="mailto:syyimyk@radev.digital" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                <a href="https://t.me/Murka_ahh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  @Murka_ahh
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Абдыкадыр Абдырахманов</CardTitle>
              <CardDescription className="text-lg">Ученик • Mobile Developer • 4 курс</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Опыт: 0.5 года</p>
                <p className="text-sm text-muted-foreground">
                  Ученик Сыймыкбека, учится на 4 курсе. Развивается под руководством главного разработчика.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Навыки
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['React Native', 'Flutter', 'Electron', 'Python', 'Java', 'Swift'].map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-secondary text-sm border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-border">
                <a href="https://github.com/abdykadyr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a href="mailto:abdykadyr@radev.digital" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                <a href="https://t.me/Badboy05y" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  @Badboy05y
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
