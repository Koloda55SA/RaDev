export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'csharp' | 'html' | 'css'

export interface Course {
  language: Language
  title: string
  description: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  content: string
  practice?: {
    starterCode?: string
    solution?: string
  }
}

export function getAllCourses(): Course[] {
  // TODO: Implement course data loading from API
  return []
}

export function getCourse(language: Language): Course | null {
  // TODO: Implement course data loading from API
  return null
}

export function getChapterAchievement(language: Language, chapterId: string): string | null {
  // TODO: Implement achievement logic
  return null
}
