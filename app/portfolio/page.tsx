'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, Github, ArrowRight, Search, Heart, Share2, Star, MessageCircle, Eye, X, History, Filter, User, Code, Image as ImageIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { apiClient } from '@/lib/api/client'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FacebookShareButton, TelegramShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share'
import { useAuth } from '@/components/auth/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useViewHistory } from '@/lib/hooks/useViewHistory'

type ProjectType = 'web' | 'mobile' | 'desktop' | 'diploma'
type Author = 'syyimyk' | 'abdykadyr' | 'both'
type SortOption = 'newest' | 'oldest' | 'popular' | 'title'

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

const ITEMS_PER_PAGE = 9

function PortfolioPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<Author | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all')
  const [selectedTech, setSelectedTech] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set())
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { addToHistory } = useViewHistory()
  const [onlyWithImages, setOnlyWithImages] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Загрузка фильтров из URL (29)
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlAuthor = searchParams.get('author')
    const urlType = searchParams.get('type')
    const urlTech = searchParams.get('tech')
    const urlSort = searchParams.get('sort')
    const urlImages = searchParams.get('images')
    
    if (urlSearch) setSearchQuery(urlSearch)
    if (urlAuthor && ['all', 'syyimyk', 'abdykadyr', 'both'].includes(urlAuthor)) {
      setSelectedAuthor(urlAuthor as Author | 'all')
    }
    if (urlType && ['all', 'web', 'mobile', 'desktop', 'diploma'].includes(urlType)) {
      setSelectedType(urlType as ProjectType | 'all')
    }
    if (urlTech) setSelectedTech(urlTech)
    if (urlSort && ['newest', 'oldest', 'popular', 'title'].includes(urlSort)) {
      setSortBy(urlSort as SortOption)
    }
    if (urlImages === 'true') setOnlyWithImages(true)
  }, [searchParams])

  // Загрузка истории поиска (31)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolioSearchHistory')
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading search history:', e)
        }
      }
    }
  }, [])

  // Автодополнение в поиске (32)
  useEffect(() => {
    if (searchQuery.length > 2) {
      const matches = projects
        .map(project => project.title.toLowerCase())
        .filter(title => title.includes(searchQuery.toLowerCase()))
        .slice(0, 5)
      setSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery, projects])

  // Сохранение фильтров в URL (29)
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedAuthor !== 'all') params.set('author', selectedAuthor)
    if (selectedType !== 'all') params.set('type', selectedType)
    if (selectedTech !== 'all') params.set('tech', selectedTech)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (onlyWithImages) params.set('images', 'true')
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/portfolio'
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedAuthor, selectedType, selectedTech, sortBy, onlyWithImages, router])

  // Сохранение в историю поиска (31)
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory].slice(0, 5)
      setSearchHistory(newHistory)
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolioSearchHistory', JSON.stringify(newHistory))
      }
    }
  }

  // Загрузка лайков из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('likedProjects')
      if (savedLikes) {
        setLikedProjects(new Set(JSON.parse(savedLikes)))
      }
    }
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await apiClient.getProjects()
        if (response.success && response.data) {
          const projectsData = response.data.map((item: any) => ({
            id: item.id || item.projectId,
            title: item.title || '',
            description: item.description || item.fullDescription || '',
            author: item.author || 'syyimyk',
            type: item.type || 'web',
            technologies: item.technologies || [],
            year: item.year || new Date(item.createdAt || Date.now()).getFullYear(),
            image: item.coverImage || item.image,
            github: item.githubUrl,
            demo: item.demoUrl,
            download: item.download,
            note: item.note,
            likes: item.likes || 0,
            views: item.views || 0,
            problem: item.problem,
            solution: item.solution,
            result: item.result,
            videoUrl: item.videoUrl,
            createdAt: item.createdAt,
          })) as Project[]
          
          setProjects(projectsData)
        } else {
          setProjects([])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading projects:', error)
        toast.error('Ошибка загрузки проектов')
        setLoading(false)
      }
    }

    loadProjects()
    
    // Polling для обновления каждые 30 секунд
    const interval = setInterval(loadProjects, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLike = async (projectId: string) => {
    if (!user) {
      toast.error('Войдите, чтобы ставить лайки')
      return
    }

    try {
      const isLiked = likedProjects.has(projectId)
      
      // Обновляем локально сразу для лучшего UX
      setLikedProjects(prev => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.delete(projectId)
        } else {
          newSet.add(projectId)
        }
        localStorage.setItem('likedProjects', JSON.stringify(Array.from(newSet)))
        return newSet
      })

      // TODO: Добавить метод likeProject в C# API
      // Пока используем локальное хранилище
      toast.success(isLiked ? 'Лайк убран' : 'Лайк добавлен')
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Ошибка при изменении лайка')
    }
  }

  const handleView = async (projectId: string) => {
    try {
      await apiClient.incrementProjectViews(projectId)
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // Фильтрация и сортировка
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          (Array.isArray(project.technologies) && project.technologies.some(tech => tech.toLowerCase().includes(query)))
        if (!matchesSearch) return false
      }

      // Фильтр по автору
      if (selectedAuthor !== 'all' && project.author !== selectedAuthor && project.author !== 'both') {
        return false
      }

      // Фильтр по типу
      if (selectedType !== 'all' && project.type !== selectedType) {
        return false
      }

      // Фильтр по технологии
      if (selectedTech !== 'all') {
        if (!Array.isArray(project.technologies) || !project.technologies.includes(selectedTech)) {
          return false
        }
      }

      // Фильтр "Только с изображениями" (34)
      if (onlyWithImages && !project.image) {
        return false
      }

      return true
    })

    // Сортировка (33)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.year || 0) - (a.year || 0)
        case 'oldest':
          return (a.year || 0) - (b.year || 0)
        case 'popular':
          return (b.likes || 0) - (a.likes || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [projects, searchQuery, selectedAuthor, selectedType, selectedTech, sortBy, onlyWithImages])

  const allTechnologies = useMemo(() => {
    const techs = new Set<string>()
    projects.forEach(project => {
      if (Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => techs.add(tech))
      }
    })
    return Array.from(techs).sort()
  }, [projects])

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedProjects, currentPage])

  const totalPages = Math.ceil(filteredAndSortedProjects.length / ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-blue">
          {t('portfolio.title') || 'Портфолио'}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          {t('portfolio.subtitle') || 'Наши проекты и работы'}
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Поиск по названию, описанию или технологиям..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSuggestions(searchQuery.length > 2 && suggestions.length > 0)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => {
                  setSearchQuery('')
                  setShowSuggestions(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {/* Автодополнение (32) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                    onClick={() => {
                      handleSearch(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* История поиска (31) */}
            {!searchQuery && searchHistory.length > 0 && showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
                <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <History className="h-3 w-3" />
                  История поиска
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center justify-between"
                    onClick={() => {
                      handleSearch(item)
                      setShowSuggestions(false)
                    }}
                  >
                    <span>{item}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newHistory = searchHistory.filter((_, i) => i !== index)
                        setSearchHistory(newHistory)
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('portfolioSearchHistory', JSON.stringify(newHistory))
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Новые</SelectItem>
              <SelectItem value="oldest">Старые</SelectItem>
              <SelectItem value="popular">Популярные</SelectItem>
              <SelectItem value="title">По названию</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Компактные фильтры */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Фильтр по автору */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {selectedAuthor === 'all' ? 'Автор' : selectedAuthor === 'syyimyk' ? 'Сыймыкбек' : selectedAuthor === 'abdykadyr' ? 'Абдыкадыр' : 'Автор'}
                {(selectedAuthor !== 'all') && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Автор</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedAuthor === 'all'}
                onCheckedChange={() => setSelectedAuthor('all')}
              >
                Все
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedAuthor === 'syyimyk'}
                onCheckedChange={() => setSelectedAuthor('syyimyk')}
              >
                Сыймыкбек
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedAuthor === 'abdykadyr'}
                onCheckedChange={() => setSelectedAuthor('abdykadyr')}
              >
                Абдыкадыр
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Фильтр по типу */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Code className="h-4 w-4" />
                {selectedType === 'all' ? 'Тип' : selectedType === 'web' ? 'Веб' : selectedType === 'mobile' ? 'Мобильное' : selectedType === 'desktop' ? 'Десктоп' : 'Диплом'}
                {(selectedType !== 'all') && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Тип проекта</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedType === 'all'}
                onCheckedChange={() => setSelectedType('all')}
              >
                Все
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'web'}
                onCheckedChange={() => setSelectedType('web')}
              >
                Веб
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'mobile'}
                onCheckedChange={() => setSelectedType('mobile')}
              >
                Мобильное
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'desktop'}
                onCheckedChange={() => setSelectedType('desktop')}
              >
                Десктоп
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedType === 'diploma'}
                onCheckedChange={() => setSelectedType('diploma')}
              >
                Диплом
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Фильтр по технологиям */}
          {allTechnologies.length > 0 && (
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="w-[180px] sm:w-[200px] gap-2">
                <Code className="h-4 w-4" />
                <SelectValue placeholder="Технологии">
                  {selectedTech === 'all' ? 'Все технологии' : selectedTech}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">Все технологии</SelectItem>
                {allTechnologies.map(tech => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Только с изображениями */}
          <Button
            variant={onlyWithImages ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyWithImages(!onlyWithImages)}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            {onlyWithImages ? 'С фото' : 'Все'}
          </Button>

          {/* Кнопка сброса фильтров */}
          {(selectedAuthor !== 'all' || selectedType !== 'all' || selectedTech !== 'all' || onlyWithImages) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedAuthor('all')
                setSelectedType('all')
                setSelectedTech('all')
                setOnlyWithImages(false)
              }}
              className="gap-2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Сбросить
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="w-full h-48" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Проекты не найдены</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onViewportEnter={() => {
                  handleView(project.id)
                  addToHistory(project.id, 'project')
                }}
              >
                <Card className="hover:border-primary transition-colors overflow-hidden flex flex-col h-full">
                  {project.image && (
                    <div className="relative w-full h-48">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies?.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies && project.technologies.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{project.year}</span>
                        <span>•</span>
                        <span>{project.author === 'syyimyk' ? 'Сыймыкбек' : project.author === 'abdykadyr' ? 'Абдыкадыр' : 'Оба'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/portfolio/${project.id}`} className="flex-1">
                        <Button variant="default" className="w-full">
                          Подробнее
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleLike(project.id)}
                        className={likedProjects.has(project.id) ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 ${likedProjects.has(project.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Назад
              </Button>
              <span className="flex items-center px-4">
                Страница {currentPage} из {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Вперед
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    }>
      <PortfolioPageContent />
    </Suspense>
  )
}
