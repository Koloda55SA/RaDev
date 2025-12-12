'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCourse, Language, getChapterAchievement } from '@/lib/courses/courseData'
import { useAuth } from '@/components/auth/useAuth'
import { updateLessonProgress, getLessonProgress, getUserCourseProgress } from '@/lib/courses/userProgress'
import { validateCode } from '@/lib/courses/codeValidator'
import { checkAndUnlockAchievement } from '@/lib/firebase/users-api'
import SimpleCodeEditor from '@/components/courses/SimpleCodeEditor'
import AchievementModal from '@/components/courses/AchievementModal'
import SubscriptionAdModal from '@/components/courses/SubscriptionAdModal'
import { ArrowLeft, BookOpen, Code, CheckCircle2, Clock, Lightbulb, Trophy } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userRole } = useAuth()
  const language = params.language as Language
  const chapterId = params.chapterId as string
  const lessonId = params.lessonId as string
  const isAdmin = userRole === 'admin'
  
  const course = getCourse(language)
  const [lesson, setLesson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('theory')
  const [theoryTime, setTheoryTime] = useState(0) // секунды изучения теории
  const [theoryTimerActive, setTheoryTimerActive] = useState(false)
  const [canStartPractice, setCanStartPractice] = useState(false)
  const [practiceTime, setPracticeTime] = useState(0) // секунды практики
  const [practiceTimerActive, setPracticeTimerActive] = useState(false)
  const [practiceStarted, setPracticeStarted] = useState(false)
  const [solutionInserted, setSolutionInserted] = useState(false)
  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [lessonProgress, setLessonProgress] = useState<any>(null)
  const [achievementModal, setAchievementModal] = useState<{ open: boolean; achievement: any }>({ open: false, achievement: null })
  const [showSubscriptionAd, setShowSubscriptionAd] = useState(false)
  const [isCodeSaved, setIsCodeSaved] = useState(false)

  useEffect(() => {
    // Не редиректим при обновлении страницы - ждем загрузки
    if (!course) {
      return
    }
    
    if (!user && !loading) {
      // Редиректим только если точно нет пользователя и загрузка завершена
      router.push('/courses')
      return
    }

    if (user) {
      const init = async () => {
        await loadProgress()
        loadLesson()
      }
      init()
    }
  }, [language, chapterId, lessonId, user, course])

  useEffect(() => {
    // Таймер для изучения теории
    let interval: NodeJS.Timeout | null = null
    if (theoryTimerActive) {
      interval = setInterval(() => {
        setTheoryTime(prev => {
          const newTime = prev + 1
          // Минимум 30 секунд изучения теории
          if (newTime >= 30) {
            setCanStartPractice(true)
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [theoryTimerActive])

  useEffect(() => {
    // Таймер для практики (2 минуты = 120 секунд)
    let interval: NodeJS.Timeout | null = null
    if (practiceTimerActive && activeTab === 'practice' && !solutionInserted) {
      interval = setInterval(() => {
        setPracticeTime(prev => {
          const newTime = prev + 1
          // 2 минуты = 120 секунд
          if (newTime >= 120 && !solutionInserted) {
            // Автоматически вставляем решение
            insertSolution()
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [practiceTimerActive, activeTab, solutionInserted])

  // Автосохранение кода в localStorage
  useEffect(() => {
    if (!code || !lesson || !user) return
    
    const storageKey = `lesson_code_${language}_${chapterId}_${lessonId}`
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, code)
        setIsCodeSaved(true)
      } catch (error) {
        console.error('Error saving code to localStorage:', error)
      }
    }, 1000) // Сохраняем через 1 секунду после последнего изменения

    return () => clearTimeout(timeoutId)
  }, [code, language, chapterId, lessonId, lesson, user])

  const loadLesson = () => {
    if (!course) return

    const chapter = course.chapters.find(ch => ch.id === chapterId)
    if (!chapter) {
      toast.error('Глава не найдена')
      router.push(`/courses/${language}`)
      return
    }

    const foundLesson = chapter.lessons.find(l => l.id === lessonId)
    if (!foundLesson) {
      toast.error('Урок не найден')
      router.push(`/courses/${language}`)
      return
    }

    // Используем урок из курса (уже сгенерированный с уникальным контентом)
    setLesson(foundLesson)
    
    // Загружаем сохраненный код из localStorage
    const storageKey = `lesson_code_${language}_${chapterId}_${lessonId}`
    const savedCode = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
    
    if (savedCode) {
      setCode(savedCode)
      setIsCodeSaved(true)
    } else {
      setCode(foundLesson.practice?.starterCode || '')
    }
    
    setLoading(false)
    
    // Админы могут сразу переходить к практике
    if (isAdmin) {
      setCanStartPractice(true)
      setTheoryTime(30)
    } else {
      // Если урок уже пройден, не запускаем таймер
      if (!lessonProgress || !lessonProgress.completed) {
        setTheoryTimerActive(true) // Начинаем отсчет времени изучения теории
      }
    }
  }

  const loadProgress = async () => {
    if (!user) return
    
    try {
      const userId = ('uid' in user ? user.uid : user.id) || ''
      if (!userId) return
      const progress = await getLessonProgress(userId, language, chapterId, lessonId)
      if (progress) {
        setLessonProgress(progress)
        if (progress.completed) {
          setCanStartPractice(true)
          setTheoryTime(30) // Устанавливаем минимум, если урок уже пройден
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const handleStartPractice = () => {
    // Админы могут сразу переходить к практике
    if (!isAdmin && !canStartPractice && theoryTime < 30 && !lessonProgress?.completed) {
      toast.error('Изучите теорию минимум 30 секунд')
      return
    }
    setActiveTab('practice')
    setTheoryTimerActive(false)
    
    // Запускаем таймер практики, если еще не запущен
    if (!practiceStarted && !lessonProgress?.completed) {
      setPracticeStarted(true)
      setPracticeTimerActive(true)
    }
  }

  // Функция для автоматической вставки решения
  const insertSolution = () => {
    if (!lesson || solutionInserted) return
    
    // Генерируем решение на основе задания
    const solution = generateSolution(lesson, language)
    setCode(solution)
    setSolutionInserted(true)
    setPracticeTimerActive(false)
    
    toast.success('⏰ Время истекло! Решение автоматически вставлено. Вы можете изучить его и попробовать снова.')
    
    // Сохраняем решение в localStorage
    const storageKey = `lesson_code_${language}_${chapterId}_${lessonId}`
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, solution)
      setIsCodeSaved(true)
    }
  }

  // Генерация решения на основе задания
  const generateSolution = (lesson: any, lang: Language): string => {
    const practice = lesson.practice
    const task = practice.task.toLowerCase()
    
    // Базовые решения для разных типов заданий
    if (task.includes('выводит') || task.includes('вывод')) {
      if (lang === 'python') {
        return `print("Привет, ${lesson.title}!")`
      } else if (lang === 'javascript') {
        return `console.log("Привет, ${lesson.title}!")`
      } else if (lang === 'java') {
        return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Привет, ${lesson.title}!");\n    }\n}`
      } else if (lang === 'cpp') {
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Привет, ${lesson.title}!" << endl;\n    return 0;\n}`
      } else if (lang === 'csharp') {
        return `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Привет, ${lesson.title}!");\n    }\n}`
      }
    } else if (task.includes('функция') || task.includes('метод')) {
      if (lang === 'python') {
        return `def process_numbers(numbers):\n    return [x ** 2 for x in numbers if x % 2 == 0]\n\n# Пример использования\nresult = process_numbers([1, 2, 3, 4, 5, 6])\nprint(result)`
      } else if (lang === 'javascript') {
        return `function processNumbers(numbers) {\n    return numbers.filter(x => x % 2 === 0).map(x => x ** 2);\n}\n\n// Пример использования\nconst result = processNumbers([1, 2, 3, 4, 5, 6]);\nconsole.log(result);`
      } else if (lang === 'java') {
        return `import java.util.*;\nimport java.util.stream.Collectors;\n\npublic class Main {\n    public static List<Integer> processNumbers(List<Integer> numbers) {\n        return numbers.stream()\n            .filter(x -> x % 2 == 0)\n            .map(x -> x * x)\n            .collect(Collectors.toList());\n    }\n}`
      } else if (lang === 'cpp') {
        return `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nstd::vector<int> processNumbers(std::vector<int> numbers) {\n    std::vector<int> result;\n    for (int x : numbers) {\n        if (x % 2 == 0) {\n            result.push_back(x * x);\n        }\n    }\n    return result;\n}`
      } else if (lang === 'csharp') {
        return `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\nclass Program {\n    static List<int> ProcessNumbers(List<int> numbers) {\n        return numbers.Where(x => x % 2 == 0).Select(x => x * x).ToList();\n    }\n}`
      }
    } else if (task.includes('класс') || task.includes('class')) {
      if (lang === 'python') {
        return `class DataProcessor:\n    def __init__(self, data):\n        self.data = data\n    \n    def process(self):\n        return [x ** 2 for x in self.data if x % 2 == 0]\n\n# Пример использования\nprocessor = DataProcessor([1, 2, 3, 4, 5, 6])\nresult = processor.process()\nprint(result)`
      } else if (lang === 'javascript') {
        return `class DataProcessor {\n    constructor(data) {\n        this.data = data;\n    }\n    \n    process() {\n        return this.data.filter(x => x % 2 === 0).map(x => x ** 2);\n    }\n}\n\n// Пример использования\nconst processor = new DataProcessor([1, 2, 3, 4, 5, 6]);\nconst result = processor.process();\nconsole.log(result);`
      } else if (lang === 'java') {
        return `import java.util.*;\nimport java.util.stream.Collectors;\n\npublic class DataProcessor {\n    private List<Integer> data;\n    \n    public DataProcessor(List<Integer> data) {\n        this.data = data;\n    }\n    \n    public List<Integer> process() {\n        return data.stream()\n            .filter(x -> x % 2 == 0)\n            .map(x -> x * x)\n            .collect(Collectors.toList());\n    }\n}`
      } else if (lang === 'cpp') {
        return `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nclass DataProcessor {\nprivate:\n    std::vector<int> data;\npublic:\n    DataProcessor(std::vector<int> d) : data(d) {}\n    std::vector<int> process() {\n        std::vector<int> result;\n        std::copy_if(data.begin(), data.end(),\n                     std::back_inserter(result),\n                     [](int x) { return x % 2 == 0; });\n        std::transform(result.begin(), result.end(),\n                      result.begin(),\n                      [](int x) { return x * x; });\n        return result;\n    }\n};`
      } else if (lang === 'csharp') {
        return `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n\npublic class DataProcessor {\n    private List<int> data;\n    \n    public DataProcessor(List<int> data) {\n        this.data = data;\n    }\n    \n    public List<int> Process() {\n        return data.Where(x => x % 2 == 0).Select(x => x * x).ToList();\n    }\n}`
      }
    }
    
    // Возвращаем стартовый код, если не удалось определить тип задания
    return practice.starterCode
  }

  const handleValidateCode = async () => {
    if (!lesson || !user) return

    setValidating(true)
    try {
      const result = await validateCode(code, language)
      const validationResult = { success: result.valid, message: result.error || 'Код проверен' }
      setValidationResult(validationResult)

      if (result.valid) {
        toast.success('🎉 Отлично! Код работает правильно!')
        
        // Останавливаем таймер практики
        setPracticeTimerActive(false)
        
        // Очищаем сохраненный код после успешной проверки
        const storageKey = `lesson_code_${language}_${chapterId}_${lessonId}`
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey)
          setIsCodeSaved(false)
        }
        
        // Сохраняем прогресс
        const timeSpent = Math.max(1, Math.ceil((theoryTime) / 60)) // минуты (минимум 1)
        try {
          const userId = ('uid' in user ? user.uid : user.id) || ''
          if (!userId) {
            throw new Error('User ID not found')
          }
          await updateLessonProgress(
            userId,
            language,
            chapterId,
            lessonId,
            true,
            timeSpent
          )

          // Разблокируем достижения
          try {
            // Достижение за первый урок
            await checkAndUnlockAchievement(userId, 'first_course_lesson_complete')
            
            // Проверяем, завершена ли глава для достижения за главу
            const userProgress = await getUserCourseProgress(userId)
            if (userProgress?.courses[language]) {
              const chapterProgress = userProgress.courses[language].chapters.find(
                (ch: any) => ch.chapterId === chapterId
              )
              if (chapterProgress?.completed) {
                const chapter = course?.chapters.find(ch => ch.id === chapterId)
                if (chapter) {
                  const achievementId = `chapter_complete_${language}_${chapterId}`
                  const unlocked = await checkAndUnlockAchievement(userId, achievementId)
                  
                  if (unlocked) {
                    // TODO: Получить данные достижения из API
                    setAchievementModal({
                      open: true,
                      achievement: {
                        icon: '🏆',
                        name: `Глава завершена: ${chapter.title}`,
                        description: `Вы успешно завершили главу "${chapter.title}"!`
                      }
                    })
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error unlocking achievement:', error)
          }

          // Перезагружаем прогресс
          await loadProgress()
          
          // Обновляем состояние урока как завершенного
          setLessonProgress((prev: any) => prev ? { ...prev, completed: true } : { completed: true, attempts: 1, timeSpent: timeSpent })
        } catch (error: any) {
          console.error('Error saving progress:', error)
          toast.error(`Ошибка сохранения прогресса: ${error.message || 'Неизвестная ошибка'}`)
        }
      } else {
        toast.error(result.error || 'Ошибка проверки кода')
      }
    } catch (error: any) {
      toast.error(`Ошибка: ${error.message}`)
    } finally {
      setValidating(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNextLesson = async () => {
    if (!course || !lesson || !user) return

    const currentChapterIndex = course.chapters.findIndex(ch => ch.id === chapterId)
    if (currentChapterIndex === -1) return

    const currentChapter = course.chapters[currentChapterIndex]
    const currentLessonIndex = currentChapter.lessons.findIndex(l => l.id === lessonId)
    
    if (currentLessonIndex === -1) return

    // Проверяем, есть ли следующий урок в текущей главе
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
      // Переходим к следующему уроку в текущей главе
      const nextLesson = currentChapter.lessons[currentLessonIndex + 1]
      router.push(`/courses/${language}/${chapterId}/${nextLesson.id}`)
    } else {
      // Переходим к первой главе следующей главы
      if (currentChapterIndex < course.chapters.length - 1) {
        const nextChapter = course.chapters[currentChapterIndex + 1]
        const firstLesson = nextChapter.lessons[0]
        router.push(`/courses/${language}/${nextChapter.id}/${firstLesson.id}`)
      } else {
        // Курс завершен - проверяем, все ли уроки завершены
        const userId = ('uid' in user ? user.uid : user.id) || ''
        if (!userId) return
        const userProgress = await getUserCourseProgress(userId)
        if (userProgress?.courses[language]) {
          const courseProgress = userProgress.courses[language]
          const course = getCourse(language)
          if (!course) {
            toast.success('🎉 Поздравляем! Вы завершили весь курс!')
            router.push(`/courses/${language}`)
            return
          }
          const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
          if (courseProgress.totalCompleted >= totalLessons) {
            // Все уроки завершены - показываем рекламу
            setShowSubscriptionAd(true)
          } else {
            toast.success('🎉 Поздравляем! Вы завершили главу!')
            router.push(`/courses/${language}`)
          }
        } else {
          toast.success('🎉 Поздравляем! Вы завершили весь курс!')
          router.push(`/courses/${language}`)
        }
      }
    }
  }

  if (loading || !lesson) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground">Загрузка урока...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="mb-6">
        <Link href={`/courses/${language}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к курсу
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">
              {course ? `Глава ${course.chapters.findIndex(ch => ch.id === chapterId) + 1 || 1}` : 'Глава'} • Урок {lessonId.split('-').pop()}
            </p>
          </div>
          {lessonProgress?.completed && (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Завершено</span>
            </div>
          )}
        </div>

        {/* Таймер изучения теории */}
        {activeTab === 'theory' && theoryTimerActive && !lessonProgress?.completed && (
          <div className="mb-4 p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Время изучения: <span className="font-semibold">{formatTime(theoryTime)}</span>
              </span>
            </div>
            {!canStartPractice && (
              <span className="text-xs text-muted-foreground">
                Минимум 30 секунд для перехода к практике
              </span>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'theory' | 'practice')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
          <TabsTrigger value="theory" className="flex items-center gap-2 text-base font-medium">
            <BookOpen className="h-5 w-5" />
            Теория
          </TabsTrigger>
          <TabsTrigger 
            value="practice" 
            className="flex items-center gap-2 text-base font-medium"
            disabled={!canStartPractice && !lessonProgress?.completed}
          >
            <Code className="h-5 w-5" />
            Практика
            {!canStartPractice && !lessonProgress?.completed && (
              <span className="ml-2 text-xs opacity-70">(30 сек)</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theory">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Теоретический материал
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Изучите материал перед выполнением практического задания
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                {typeof window !== 'undefined' && (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const language = match ? match[1] : ''
                        return !inline && match ? (
                          <div className="my-4">
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language || 'text'}
                              PreTag="div"
                              className="rounded-lg"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {lesson.theory}
                  </ReactMarkdown>
                )}
              </div>

              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {!canStartPractice && !lessonProgress?.completed && (
                    <span>Изучите теорию минимум 30 секунд</span>
                  )}
                </div>
                <Button
                  onClick={handleStartPractice}
                  disabled={!canStartPractice && !lessonProgress?.completed}
                  size="lg"
                  className="gap-2"
                >
                  Перейти к практике
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          <div className="space-y-6">
            {/* Таймер практики */}
            {practiceTimerActive && !solutionInserted && !lessonProgress?.completed && (
              <div className="mb-4 p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-semibold text-orange-500">Таймер практики</p>
                      <p className="text-xs text-muted-foreground">
                        Осталось времени: <span className="font-bold text-orange-500">{formatTime(120 - practiceTime)}</span>
                      </p>
                    </div>
                  </div>
                  {practiceTime >= 90 && (
                    <div className="text-xs text-orange-500 font-semibold animate-pulse">
                      ⚠️ Осталось менее 30 секунд!
                    </div>
                  )}
                </div>
                <div className="mt-3 w-full bg-orange-500/20 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((120 - practiceTime) / 120) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {solutionInserted && (
              <div className="mb-4 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-blue-500">Решение вставлено автоматически</p>
                    <p className="text-xs text-muted-foreground">
                      Изучите решение и попробуйте понять логику. Вы можете изменить код и попробовать снова.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Практическое задание
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {lesson.practice.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary">Задание:</h3>
                  <p className="text-sm leading-relaxed">{lesson.practice.task}</p>
                </div>

                {lesson.practice.hints && lesson.practice.hints.length > 0 && (
                  <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-2 text-yellow-300">Подсказки:</p>
                        <ul className="text-sm text-muted-foreground space-y-1.5">
                          {lesson.practice.hints.map((hint: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>{hint}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Напишите код</CardTitle>
                    <CardDescription className="mt-1">
                      Редактируйте код ниже и нажмите кнопку проверки
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleValidateCode}
                    disabled={validating || !code.trim()}
                    size="lg"
                    className="gap-2"
                  >
                    {validating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Проверка...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Проверить решение
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div style={{ height: '450px', minHeight: '350px' }}>
                  <div className="space-y-2">
                    {isCodeSaved && (
                      <div className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Код автоматически сохранен
                      </div>
                    )}
                    <SimpleCodeEditor
                      value={code}
                      language={language}
                      onChange={setCode}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Результат проверки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!validationResult ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Напишите код и нажмите кнопку проверки</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      validationResult.success
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        {validationResult.success ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Code className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-base mb-3 ${
                            validationResult.success ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {validationResult.message}
                          </p>
                          
                          {validationResult.output && (
                            <div className="space-y-2 mb-3">
                              <p className="text-sm font-medium text-muted-foreground">Вывод программы:</p>
                              <pre className="text-sm bg-background/80 p-3 rounded border border-border overflow-x-auto font-mono">
                                {validationResult.output || '(нет вывода)'}
                              </pre>
                            </div>
                          )}

                          {validationResult.testResults && validationResult.testResults.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Результаты тестов:</p>
                              <div className="space-y-1.5">
                                {validationResult.testResults.map((test: any, i: number) => (
                                  <div
                                    key={i}
                                    className={`text-sm p-2.5 rounded border ${
                                      test.passed 
                                        ? 'bg-green-500/10 border-green-500/20 text-green-300' 
                                        : 'bg-red-500/10 border-red-500/20 text-red-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{test.passed ? '✅' : '❌'}</span>
                                      <span className="font-medium">
                                        {test.description || `Тест ${i + 1}`}
                                      </span>
                                    </div>
                                    {!test.passed && test.expected && (
                                      <div className="mt-2 text-xs text-muted-foreground pl-6">
                                        Ожидалось: {test.expected}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {validationResult?.success && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30 rounded-lg">
                          <div className="flex items-center gap-3 text-primary">
                            <Trophy className="h-6 w-6" />
                            <div>
                              <p className="font-bold text-lg">🎉 Урок завершен!</p>
                              <p className="text-sm text-primary/80">Отлично! Вы можете перейти к следующему уроку.</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleNextLesson}
                          size="lg"
                          className="w-full gap-2"
                        >
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                          Следующий урок
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <AchievementModal
        open={achievementModal.open}
        onClose={() => setAchievementModal({ open: false, achievement: null })}
        achievement={achievementModal.achievement || { icon: '🏆', name: '', description: '' }}
      />
      <SubscriptionAdModal
        open={showSubscriptionAd}
        onClose={() => {
          setShowSubscriptionAd(false)
          router.push(`/courses/${language}`)
        }}
      />
    </div>
  )
}
