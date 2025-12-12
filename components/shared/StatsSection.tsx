'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { BookOpen, Users, FileText, Code } from 'lucide-react'
import { getCourse, Language } from '@/lib/courses/courseData'
import { apiClient } from '@/lib/api/client'

export default function StatsSection() {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    blogPosts: 0,
    lessons: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Считаем количество курсов
        const languages: Language[] = ['python', 'javascript', 'java', 'cpp', 'csharp']
        const coursesCount = languages.length

        // Считаем общее количество уроков во всех курсах
        let totalLessons = 0
        languages.forEach(lang => {
          const course = getCourse(lang)
          if (course) {
            totalLessons += course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
          }
        })

        // Получаем статистику из C# API
        const [blogResponse, usersResponse] = await Promise.all([
          apiClient.getBlogPosts().catch(() => ({ success: false, data: [] })),
          apiClient.searchUsers('').catch(() => ({ success: false, data: [] }))
        ])

        const blogCount = blogResponse.success && Array.isArray(blogResponse.data) ? blogResponse.data.length : 0
        const studentsCount = usersResponse.success && Array.isArray(usersResponse.data) ? usersResponse.data.length : 0

        setStats({
          courses: coursesCount,
          students: studentsCount || 0,
          blogPosts: blogCount,
          lessons: totalLessons
        })
      } catch (error) {
        console.error('Error loading stats:', error)
        // Fallback значения
        setStats({
          courses: 5,
          students: 0,
          blogPosts: 0,
          lessons: 0
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 text-center animate-pulse">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  const statItems = [
    {
      icon: BookOpen,
      value: stats.courses,
      label: 'Курсов программирования',
      color: 'text-blue-400'
    },
    {
      icon: Users,
      value: stats.students,
      label: 'Студентов обучаются',
      color: 'text-purple-400'
    },
    {
      icon: FileText,
      value: stats.blogPosts,
      label: 'Статей в блоге',
      color: 'text-green-400'
    },
    {
      icon: Code,
      value: stats.lessons,
      label: 'Уроков доступно',
      color: 'text-pink-400'
    }
  ]

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={index}
              className="p-4 md:p-6 text-center border-2 border-border/30 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md hover:border-primary/70 transition-all duration-300 hover:scale-105"
            >
              <Icon className={`h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 ${item.color}`} />
              <div className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-1 ${item.color}`}>
                {item.value}+
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium">
                {item.label}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
