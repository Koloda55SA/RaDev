'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAllCourses, Language } from '@/lib/courses/courseData'
import { useAuth } from '@/components/auth/useAuth'
import { getUserCourseProgress } from '@/lib/courses/userProgress'
import { BookOpen, TrendingUp, Clock, Award } from 'lucide-react'
import Link from 'next/link'

export default function CoursesPage() {
  const router = useRouter()
  const { user } = useAuth()
  // Временно отключаем загрузку курсов - они будут переписаны новой логикой
  // const courses = getAllCourses()
  const courses: any[] = []
  const [progress, setProgress] = useState<Record<Language, any>>({} as any)

  // Загружаем прогресс пользователя
  useEffect(() => {
    if (user) {
      loadProgress()
    }
  }, [user])

  const loadProgress = async () => {
    if (!user) return
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      const userProgress = await getUserCourseProgress(userId)
      if (userProgress) {
        setProgress(userProgress.courses)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const getProgressForCourse = (language: Language) => {
    const courseProgress = progress[language]
    if (!courseProgress) return { completed: 0, total: 0, percentage: 0 }
    
    return {
      completed: courseProgress.totalCompleted || 0,
      total: courseProgress.totalLessons || 0,
      percentage: courseProgress.totalLessons > 0 
        ? Math.round((courseProgress.totalCompleted / courseProgress.totalLessons) * 100)
        : 0
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 glow-blue">
          📚 Бесплатные курсы программирования
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Изучайте программирование с нуля. Интерактивные уроки, практика и достижения ждут вас!
        </p>
      </div>

      {courses.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Курсы в разработке</h2>
            <p className="text-muted-foreground">
              Мы работаем над новой системой курсов. Скоро здесь появятся интерактивные уроки по программированию!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => {
          const prog = getProgressForCourse(course.language)
          
          return (
            <Card key={course.language} className="hover:border-primary transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">📚</span>
                  {prog.percentage > 0 && (
                    <span className="text-sm font-semibold text-primary">
                      {prog.percentage}%
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.chapters.reduce((sum: number, ch: any) => sum + ch.lessons.length, 0)} уроков</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{course.chapters.length} глав</span>
                    </div>
                  </div>

                  {prog.total > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Прогресс</span>
                        <span>{prog.completed} / {prog.total}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${prog.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link href={`/courses/${course.language}`} className="block">
                    <Button className="w-full" variant={prog.percentage > 0 ? 'default' : 'outline'}>
                      {prog.percentage > 0 ? 'Продолжить' : 'Начать курс'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6" />
          Что вас ждет?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Интерактивная теория</h3>
              <p className="text-sm text-muted-foreground">
                Подробные объяснения с примерами кода для каждого урока
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Практика в IDE</h3>
              <p className="text-sm text-muted-foreground">
                Выполняйте задания прямо в браузере с автоматической проверкой
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Гибкий график</h3>
              <p className="text-sm text-muted-foreground">
                Изучайте в своем темпе, с таймером для изучения теории
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Достижения</h3>
              <p className="text-sm text-muted-foreground">
                Получайте награды за прохождение уроков и глав
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

