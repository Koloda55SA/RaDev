// Управление прогрессом пользователя в курсах

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getDb } from '../firebase/config'
import { Language, Lesson, getCourse } from './courseData'

export interface LessonProgress {
  lessonId: string
  completed: boolean
  completedAt?: string
  attempts: number
  bestScore?: number
  timeSpent: number // минуты
}

export interface ChapterProgress {
  chapterId: string
  lessons: LessonProgress[]
  completed: boolean
  completedAt?: string
}

export interface CourseProgress {
  language: Language
  chapters: ChapterProgress[]
  currentChapterId?: string
  currentLessonId?: string
  totalCompleted: number
  totalLessons: number
  startedAt: string
  lastAccessedAt: string
}

export interface UserCourseProgress {
  uid: string
  courses: Record<Language, CourseProgress>
}

export async function getUserCourseProgress(uid: string): Promise<UserCourseProgress | null> {
  const progressRef = doc(getDb(), 'course_progress', uid)
  const progressSnap = await getDoc(progressRef)
  
  if (!progressSnap.exists()) {
    return null
  }
  
  return progressSnap.data() as UserCourseProgress
}

export async function initializeCourseProgress(uid: string, language: Language): Promise<void> {
  const progressRef = doc(getDb(), 'course_progress', uid)
  const progressSnap = await getDoc(progressRef)
  
  const existing: UserCourseProgress = progressSnap.exists() 
    ? (progressSnap.data() as UserCourseProgress)
    : { uid, courses: {} as Record<Language, CourseProgress> }
  
  if (!existing.courses) {
    existing.courses = {} as Record<Language, CourseProgress>
  }
  
  if (!existing.courses[language]) {
    const course = getCourse(language)
    if (!course) {
      throw new Error(`Course for language ${language} not found`)
    }
    existing.courses[language] = {
      language,
      chapters: [],
      totalCompleted: 0,
      totalLessons: course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
      startedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  }
  
  // Используем setDoc с merge для создания/обновления документа
  await setDoc(progressRef, existing, { merge: true })
}

export async function updateLessonProgress(
  uid: string,
  language: Language,
  chapterId: string,
  lessonId: string,
  completed: boolean,
  timeSpent: number
): Promise<void> {
  const progressRef = doc(getDb(), 'course_progress', uid)
  const progressSnap = await getDoc(progressRef)
  
  let userProgress: UserCourseProgress = progressSnap.exists()
    ? (progressSnap.data() as UserCourseProgress)
    : { uid, courses: {} as Record<Language, CourseProgress> }
  
  if (!userProgress.courses) {
    userProgress.courses = {} as Record<Language, CourseProgress>
  }
  
  if (!userProgress.courses[language]) {
    await initializeCourseProgress(uid, language)
    const updatedSnap = await getDoc(progressRef)
    userProgress = updatedSnap.data() as UserCourseProgress
  }
  
  const courseProgress = userProgress.courses[language]
  const course = getCourse(language)
  if (!course) {
    throw new Error(`Course for language ${language} not found`)
  }
  
  // Находим или создаем главу
  let chapterProgress = courseProgress.chapters.find(ch => ch.chapterId === chapterId)
  if (!chapterProgress) {
    chapterProgress = {
      chapterId,
      lessons: [],
      completed: false
    }
    courseProgress.chapters.push(chapterProgress)
  }
  
  if (!chapterProgress.lessons) {
    chapterProgress.lessons = []
  }
  
  // Находим или создаем урок
  let lessonProgress = chapterProgress.lessons.find((l: any) => l.lessonId === lessonId)
  const isNewLesson = !lessonProgress
  if (!lessonProgress) {
    lessonProgress = {
      lessonId,
      completed: false,
      attempts: 0,
      timeSpent: 0
    }
    chapterProgress.lessons.push(lessonProgress)
  }
  
  // Обновляем прогресс
  if (!completed || !lessonProgress.completed) {
    lessonProgress.attempts++
  }
  lessonProgress.timeSpent += timeSpent
  
  if (completed && !lessonProgress.completed) {
    lessonProgress.completed = true
    lessonProgress.completedAt = new Date().toISOString()
    courseProgress.totalCompleted++
    
    // Проверяем, завершена ли глава
    const courseChapter = course.chapters.find(ch => ch.id === chapterId)
    if (courseChapter) {
      const totalLessonsInChapter = courseChapter.lessons.length
      const completedLessonsInChapter = chapterProgress.lessons.filter((l: any) => l.completed).length
      
      if (completedLessonsInChapter === totalLessonsInChapter && totalLessonsInChapter > 0) {
        chapterProgress.completed = true
        if (!chapterProgress.completedAt) {
          chapterProgress.completedAt = new Date().toISOString()
        }
      }
    }
  }
  
  courseProgress.lastAccessedAt = new Date().toISOString()
  courseProgress.currentChapterId = chapterId
  courseProgress.currentLessonId = lessonId
  
  // Используем setDoc с merge для создания/обновления документа
  // Это работает даже если документ не существует
  await setDoc(progressRef, userProgress, { merge: true })
}

export async function getLessonProgress(
  uid: string,
  language: Language,
  chapterId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const userProgress = await getUserCourseProgress(uid)
  if (!userProgress || !userProgress.courses[language]) {
    return null
  }
  
  const chapter = userProgress.courses[language].chapters.find(ch => ch.chapterId === chapterId)
  if (!chapter) {
    return null
  }
  
  return chapter.lessons.find(l => l.lessonId === lessonId) || null
}
