'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Tag, X, History } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import BlogCardLazy from '@/components/blog/BlogCardLazy'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: 'syyimyk' | 'abdykadyr'
  date: string
  category: string
  readTime: string
  tags?: string[]
  image?: string
  views?: number
}

type SortOption = 'newest' | 'oldest' | 'title' | 'popular'

function BlogPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Все')
  const [selectedTag, setSelectedTag] = useState<string>('Все')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [onlyWithImages, setOnlyWithImages] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Загрузка фильтров из URL
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    const urlCategory = searchParams.get('category')
    const urlTag = searchParams.get('tag')
    const urlSort = searchParams.get('sort')
    const urlImages = searchParams.get('images')

    if (urlSearch) setSearchQuery(urlSearch)
    if (urlCategory) setSelectedCategory(urlCategory)
    if (urlTag) setSelectedTag(urlTag)
    if (urlSort && ['newest', 'oldest', 'title', 'popular'].includes(urlSort)) {
      setSortBy(urlSort as SortOption)
    }
    if (urlImages === 'true') setOnlyWithImages(true)
  }, [searchParams])

  // Загрузка истории поиска
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('blogSearchHistory')
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading search history:', e)
        }
      }
    }
  }, [])

  // Автодополнение в поиске
  useEffect(() => {
    if (searchQuery.length > 2) {
      const matches = posts
        .map(post => post.title.toLowerCase())
        .filter(title => title.includes(searchQuery.toLowerCase()))
        .slice(0, 5)
      setSuggestions(matches)
      setShowSuggestions(matches.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery, posts])

  // Сохранение фильтров в URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory !== 'Все') params.set('category', selectedCategory)
    if (selectedTag !== 'Все') params.set('tag', selectedTag)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (onlyWithImages) params.set('images', 'true')

    const newUrl = params.toString() ? `?${params.toString()}` : '/blog'
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedCategory, selectedTag, sortBy, onlyWithImages, router])

  // Сохранение в историю поиска
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory].slice(0, 5)
      setSearchHistory(newHistory)
      if (typeof window !== 'undefined') {
        localStorage.setItem('blogSearchHistory', JSON.stringify(newHistory))
      }
    }
  }

  useEffect(() => {
    const loadBlogPosts = async () => {
      setLoading(true)
      try {
        const response = await apiClient.getBlogPosts()
        if (response.success && response.data) {
          const postsData = response.data.map((item: any) => ({
            id: item.id || item.postId,
            title: item.title || '',
            excerpt: item.excerpt || '',
            author: item.authorName || item.author || 'syyimyk',
            date: item.publishedAt || item.createdAt || item.date || new Date().toISOString(),
            category: item.category || 'Общее',
            readTime: item.readTime || '5 мин',
            tags: item.tags || [],
            image: item.coverImage || item.image,
            views: item.views || 0,
          })) as BlogPost[]
          
          setPosts(postsData)
        } else {
          setPosts([])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading blog posts:', error)
        setLoading(false)
      }
    }

    loadBlogPosts()
    
    // Polling для обновления каждые 30 секунд
    const interval = setInterval(loadBlogPosts, 30000)
    return () => clearInterval(interval)
  }, [])

  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    posts.forEach(post => {
      if (post.category) cats.add(post.category)
    })
    return Array.from(cats).sort()
  }, [posts])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [posts])

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(post.tags) && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesCategory = selectedCategory === 'Все' || post.category === selectedCategory

      const matchesTag = selectedTag === 'Все' ||
        (Array.isArray(post.tags) && post.tags.includes(selectedTag))

      // Фильтр "Только с изображениями" (34)
      const matchesImages = !onlyWithImages || !!post.image

      return matchesSearch && matchesCategory && matchesTag && matchesImages
    })

    // Сортировка результатов (33)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'popular':
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [posts, searchQuery, selectedCategory, selectedTag, sortBy, onlyWithImages])

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-blue">
          {t('blog.title') || 'Блог'}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          {t('blog.subtitle') || 'Полезные статьи и новости'}
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Поиск по статьям..."
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
                        localStorage.setItem('blogSearchHistory', JSON.stringify(newHistory))
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

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Новые</SelectItem>
              <SelectItem value="oldest">Старые</SelectItem>
              <SelectItem value="title">По названию</SelectItem>
              <SelectItem value="popular">Популярные</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={onlyWithImages ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyWithImages(!onlyWithImages)}
          >
            Только с изображениями
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Категории:</span>
            <Button
              variant={selectedCategory === 'Все' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('Все')}
            >
              Все
            </Button>
            {allCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Теги:</span>
            <Button
              variant={selectedTag === 'Все' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag('Все')}
            >
              Все
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
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
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Статьи не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCardLazy key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  )
}
