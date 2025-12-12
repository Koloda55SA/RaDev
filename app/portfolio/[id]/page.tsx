'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Github, ArrowLeft, Heart, MessageCircle, Eye, Share2 } from 'lucide-react'
import { getDb } from '@/lib/firebase/config'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FacebookShareButton, TelegramShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share'
import { useAuth } from '@/components/auth/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import CommentSection from '@/components/shared/CommentSection'
import { useActivityTracking } from '@/lib/hooks/useActivityTracking'

type ProjectType = 'web' | 'mobile' | 'desktop' | 'diploma'
type Author = 'syyimyk' | 'abdykadyr' | 'both'

interface Project {
  id: string
  title: string
  description: string
  author: Author
  type: ProjectType
  technologies: string[]
  year: number
  image?: string
  github?: string
  demo?: string
  download?: string
  note?: string
  likes?: number
  views?: number
  problem?: string
  solution?: string
  result?: string
  videoUrl?: string
}

// Комментарии теперь в CommentSection компоненте

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { trackProjectView } = useActivityTracking()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    const savedLikes = localStorage.getItem('likedProjects')
    if (savedLikes) {
      setLikedProjects(new Set(JSON.parse(savedLikes)))
    }
  }, [])

  useEffect(() => {
    const loadProject = async () => {
      if (!params?.id || typeof params.id !== 'string') {
        toast.error('Проект не найден')
        router.push('/portfolio')
        return
      }

      try {
        const projectDoc = await getDoc(doc(getDb(), 'projects', params.id))
        
        if (!projectDoc.exists()) {
          toast.error('Проект не найден')
          router.push('/portfolio')
          return
        }

        const projectData = {
          id: projectDoc.id,
          ...projectDoc.data(),
          likes: projectDoc.data().likes || 0,
          views: projectDoc.data().views || 0,
        } as Project

        setProject(projectData)
        setIsLiked(likedProjects.has(params.id))
        setLoading(false)

        // Увеличиваем просмотры
        await updateDoc(doc(getDb(), 'projects', params.id), {
          views: increment(1)
        })

        // Отслеживаем просмотр проекта для достижений
        await trackProjectView()
      } catch (error) {
        console.error('Error loading project:', error)
        toast.error('Ошибка загрузки проекта')
        router.push('/portfolio')
      }
    }

    loadProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, router])

  // Комментарии теперь в CommentSection компоненте

  const handleLike = async () => {
    if (!user) {
      toast.error('Войдите, чтобы ставить лайки')
      return
    }

    if (!project) return

    const projectRef = doc(getDb(), 'projects', project.id)
    const newLiked = new Set(likedProjects)

    try {
      if (isLiked) {
        await updateDoc(projectRef, {
          likes: increment(-1)
        })
        newLiked.delete(project.id)
        setIsLiked(false)
        toast.success('Лайк убран')
      } else {
        await updateDoc(projectRef, {
          likes: increment(1)
        })
        newLiked.add(project.id)
        setIsLiked(true)
        toast.success('Лайк поставлен')
      }
      setLikedProjects(newLiked)
      localStorage.setItem('likedProjects', JSON.stringify(Array.from(newLiked)))
    } catch (error) {
      console.error('Error updating like:', error)
      toast.error('Ошибка при обновлении лайка')
    }
  }

  // Комментарии теперь в CommentSection компоненте

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card>
          <Skeleton className="w-full h-64 md:h-96" />
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-muted-foreground">Проект не найден</p>
          <Link href="/portfolio">
            <Button className="mt-4">Вернуться к портфолио</Button>
          </Link>
        </div>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <Breadcrumbs 
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Портфолио', href: '/portfolio' },
        ]}
        currentLabel={project?.title}
      />
      <Link href="/portfolio">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к портфолио
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          {project.image && (
            <div className="relative w-full h-64 md:h-96">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {project.videoUrl && (
            <div className="w-full aspect-video mb-4">
              <iframe
                src={project.videoUrl}
                title={project.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-2xl md:text-3xl">{project.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  title="Лайк"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <FacebookShareButton url={shareUrl} title={project.title}>
                  <Button variant="ghost" size="icon" title="Поделиться">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </FacebookShareButton>
              </div>
            </div>
            <CardDescription className="text-base md:text-lg whitespace-pre-wrap">
              {project.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {project.views || 0} просмотров
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {project.likes || 0} лайков
              </div>
              {/* Количество комментариев отображается в CommentSection */}
            </div>

            {(project.problem || project.solution || project.result) && (
              <div className="space-y-4 p-4 rounded-lg bg-secondary/50">
                {project.problem && (
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Проблема</h3>
                    <p className="text-sm text-muted-foreground">{project.problem}</p>
                  </div>
                )}
                {project.solution && (
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Решение</h3>
                    <p className="text-sm text-muted-foreground">{project.solution}</p>
                  </div>
                )}
                {project.result && (
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Результат</h3>
                    <p className="text-sm text-muted-foreground">{project.result}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Автор</p>
                <p className="text-base">
                  {project.author === 'syyimyk' 
                    ? 'Сыймыкбек (Главный)' 
                    : project.author === 'abdykadyr' 
                    ? 'Абдыкадыр' 
                    : 'Оба'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Год</p>
                <p className="text-base">{project.year}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Тип проекта</p>
                <p className="text-base capitalize">
                  {project.type === 'web' ? 'Веб-приложение' 
                    : project.type === 'mobile' ? 'Мобильное приложение'
                    : project.type === 'desktop' ? 'Десктоп приложение'
                    : 'Дипломная работа'}
                </p>
              </div>
            </div>

            {project.note && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ {project.note}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Технологии</p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.technologies) ? (
                  project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-md bg-secondary text-sm border border-border hover:border-primary transition-colors"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Не указано</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 border border-border hover:border-primary transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 border border-border hover:border-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Демо</span>
                </a>
              )}
              {project.download && (
                <a
                  href={project.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 border border-border hover:border-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Скачать</span>
                </a>
              )}
            </div>

            {/* Комментарии */}
            <div className="pt-6 border-t border-border">
              <CommentSection itemId={project.id} itemType="project" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
