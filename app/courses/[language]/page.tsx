'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCourse, Language } from '@/lib/courses/courseData'
import { getUserCourseProgress, initializeCourseProgress } from '@/lib/courses/userProgress'
import { useAuth } from '@/components/auth/useAuth'
import { CheckCircle2, Circle, Lock, BookOpen, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function CourseRoadmapPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userRole } = useAuth()
  const language = params.language as Language
  const course = getCourse(language)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    if (!course) {
      toast.error('Курс не найден')
      router.push('/courses')
      return
    }

    if (!user) {
      toast.error('Войдите, чтобы начать курс')
      router.push('/login?redirect=/courses')
      return
    }

    loadProgress()
  }, [language, user])

  const loadProgress = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      await initializeCourseProgress(userId, language)
      const userProgress = await getUserCourseProgress(userId)
      
      if (userProgress && userProgress.courses[language]) {
        setProgress(userProgress.courses[language])
      }
    } catch (error) {
      console.error('Error loading progress:', error)
      toast.error('Ошибка загрузки прогресса')
    } finally {
      setLoading(false)
    }
  }

  const getChapterProgress = (chapterId: string) => {
    if (!progress) return { completed: 0, total: 0, unlocked: false, allCompleted: false }
    
    const chapter = progress.chapters.find((ch: any) => ch.chapterId === chapterId)
    if (!chapter) return { completed: 0, total: 0, unlocked: false, allCompleted: false }
    
    const completed = chapter.lessons.filter((l: any) => l.completed).length
    const total = chapter.lessons.length
    
    // Также проверяем реальное количество уроков в главе из courseData
    const courseChapter = course?.chapters.find(ch => ch.id === chapterId)
    const realTotal = courseChapter?.lessons.length || total
    
    return {
      completed,
      total: realTotal,
      unlocked: true,
      allCompleted: chapter.completed || (completed >= realTotal && realTotal > 0)
    }
  }

  const isChapterUnlocked = (chapterIndex: number) => {
    // Админы имеют доступ ко всем главам
    if (isAdmin) return true
    if (chapterIndex === 0) return true
    if (!progress) return false
    
    // Глава разблокирована, если предыдущая завершена
    const prevChapter = progress.chapters.find((ch: any, idx: number) => idx === chapterIndex - 1)
    return prevChapter?.completed || false
  }

  if (loading || !course) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-primary/40 border-r-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-muted-foreground">Загрузка курса...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="mb-8">
        <Link href="/courses">
          <Button variant="ghost" className="mb-4">
            ← Назад к курсам
          </Button>
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">📚</span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
        </div>

        {progress && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Общий прогресс</span>
              <span className="text-sm font-semibold">
                {progress.totalCompleted || 0} / {progress.totalLessons || course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{
                  width: `${progress.totalLessons > 0 
                    ? Math.round((progress.totalCompleted / progress.totalLessons) * 100)
                    : 0}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Roadmap - карта прогресса */}
      <div className="space-y-6">
        {course.chapters.map((chapter, chapterIndex) => {
          const chapterProg = getChapterProgress(chapter.id)
          const unlocked = isChapterUnlocked(chapterIndex)
          
          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: chapterIndex * 0.1 }}
            >
              <Card className={`${
                unlocked 
                  ? chapterProg.allCompleted 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-primary/50' 
                  : 'opacity-60'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {unlocked ? (
                        chapterProg.allCompleted ? (
                          <div className="relative">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              ✓
                            </span>
                          </div>
                        ) : (
                          <BookOpen className="h-6 w-6 text-primary" />
                        )
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className={`text-xl ${
                          chapterProg.allCompleted ? 'text-green-500' : ''
                        }`}>
                          Глава {chapterIndex + 1}. {chapter.title}
                          {chapterProg.allCompleted && (
                            <span className="ml-2 text-sm font-normal text-green-500">
                              (Окончено)
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{chapter.description}</CardDescription>
                      </div>
                    </div>
                    {unlocked && chapterProg.total > 0 && (
                      <div className={`text-sm font-semibold ${
                        chapterProg.allCompleted ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {chapterProg.completed} / {chapterProg.total}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chapter.lessons.map((lesson, lessonIndex) => {
                      const lessonProgress = progress?.chapters
                        .find((ch: any) => ch.chapterId === chapter.id)
                        ?.lessons.find((l: any) => l.lessonId === lesson.id)
                      
                      const isCompleted = lessonProgress?.completed || false
                      
                      // Урок разблокирован если:
                      // 1. Пользователь админ (всегда разблокировано)
                      // 2. Это первый урок в главе И глава разблокирована
                      // 3. ИЛИ предыдущий урок завершен
                      const prevLessonId = lessonIndex > 0 ? chapter.lessons[lessonIndex - 1]?.id : null
                      const prevLessonCompleted = prevLessonId 
                        ? progress?.chapters
                            .find((ch: any) => ch.chapterId === chapter.id)
                            ?.lessons.find((l: any) => l.lessonId === prevLessonId)
                            ?.completed
                        : true
                      
                      const isUnlocked = isAdmin || (unlocked && (lessonIndex === 0 || prevLessonCompleted === true))

                      return (
                        <Link
                          key={lesson.id}
                          href={isUnlocked ? `/courses/${language}/${chapter.id}/${lesson.id}` : '#'}
                          onClick={(e) => {
                            if (!isUnlocked) {
                              e.preventDefault()
                              toast.error('Сначала завершите предыдущий урок')
                            }
                          }}
                        >
                          <div
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isCompleted
                                ? 'border-green-500 bg-green-500/10 hover:bg-green-500/15'
                                : isUnlocked
                                ? 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10 cursor-pointer'
                                : 'border-muted bg-muted/30 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {isCompleted ? (
                                  <div className="relative">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  </div>
                                ) : isUnlocked ? (
                                  <Circle className="h-5 w-5 text-primary" />
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className={`font-semibold text-sm ${
                                  isCompleted ? 'text-green-500' : ''
                                }`}>
                                  {lesson.title}
                                  {isCompleted && (
                                    <span className="ml-2 text-xs text-green-500">✓</span>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>~10 мин</span>
                              <span>•</span>
                              <span>Сложность: 5/10</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


