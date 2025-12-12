'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getDb } from '@/lib/firebase/config'
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore'
import Image from 'next/image'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Project {
  id: string
  title: string
  description: string
  type: string
  technologies: string[]
  year: number
  image?: string
  github?: string
  demo?: string
  likes?: number
  views?: number
}

export default function ComparePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('compareProjects')
    if (saved) {
      try {
        setSelectedProjects(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing compare projects:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('compareProjects', JSON.stringify(selectedProjects))
  }, [selectedProjects])

  useEffect(() => {
    const q = query(collection(getDb(), 'projects'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const projectsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[]
        
        setProjects(projectsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error loading projects:', error)
        toast.error('Ошибка загрузки проектов')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const addToCompare = (projectId: string) => {
    if (selectedProjects.length >= 3) {
      toast.error('Можно сравнить максимум 3 проекта')
      return
    }
    if (selectedProjects.includes(projectId)) {
      toast.error('Проект уже добавлен')
      return
    }
    setSelectedProjects([...selectedProjects, projectId])
    toast.success('Проект добавлен к сравнению')
  }

  const removeFromCompare = (projectId: string) => {
    setSelectedProjects(selectedProjects.filter(id => id !== projectId))
  }

  const selectedProjectsData = selectedProjects
    .map(id => projects.find(p => p.id === id))
    .filter(Boolean) as Project[]

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mb-8">
        <Link href="/portfolio">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к портфолио
          </Button>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-blue">
          Сравнение проектов
        </h1>
        <p className="text-lg text-muted-foreground">
          Выберите до 3 проектов для сравнения
        </p>
      </div>

      {selectedProjects.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProjectsData.length + 1}, minmax(300px, 1fr))` }}>
            <div className="font-semibold p-4">Критерий</div>
            {selectedProjectsData.map((project) => (
              <div key={project.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => removeFromCompare(project.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {project.image && (
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <h3 className="font-semibold mb-2">{project.title}</h3>
              </div>
            ))}
          </div>

          <Card className="mt-4">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Название</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4">{project.title}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Тип</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4 capitalize">{project.type}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Год</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4">{project.year}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Технологии</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(project.technologies) ? project.technologies.map((tech) => (
                              <span key={tech} className="px-2 py-1 rounded bg-secondary text-xs">
                                {tech}
                              </span>
                            )) : 'Не указано'}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Просмотры</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4">{project.views || 0}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Лайки</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4">{project.likes || 0}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Ссылки</td>
                      {selectedProjectsData.map((project) => (
                        <td key={project.id} className="p-4">
                          <div className="flex flex-col gap-1">
                            {project.demo && (
                              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                Демо
                              </a>
                            )}
                            {project.github && (
                              <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                GitHub
                              </a>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Выберите проекты для сравнения</h2>
        {loading ? (
          <p className="text-muted-foreground">Загрузка...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="relative">
                {selectedProjects.includes(project.id) ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>Уже добавлен</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeFromCompare(project.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                ) : (
                  <>
                    {project.image && (
                      <div className="relative w-full h-32">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => addToCompare(project.id)}
                        disabled={selectedProjects.length >= 3}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить к сравнению
                      </Button>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

