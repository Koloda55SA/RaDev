'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowLeft, Bookmark, Eye, Clock } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { db, getDb } from '@/lib/firebase/config'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import toast from 'react-hot-toast'
import ReadingProgress from '@/components/shared/ReadingProgress'
import { useFavorites } from '@/lib/hooks/useFavorites'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import ShareButton from '@/components/shared/ShareButton'
import CopyButton from '@/components/shared/CopyButton'
import CommentSection from '@/components/shared/CommentSection'
import { useSwipe } from '@/lib/hooks/useSwipe'
import { useActivityTracking } from '@/lib/hooks/useActivityTracking'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const { toggleFavorite, isFavorite } = useFavorites()
  const { trackBlogRead } = useActivityTracking()
  const postId = params.id as string
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [views, setViews] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // Загружаем все посты для навигации
  useEffect(() => {
    const loadAllPosts = async () => {
      try {
        const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
        const q = query(collection(getDb(), 'blog_posts'), orderBy('date', 'desc'))
        const snapshot = await getDocs(q)
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAllPosts(posts)
        const index = posts.findIndex(p => p.id === postId)
        setCurrentIndex(index)
      } catch (error) {
        console.error('Error loading posts:', error)
      }
    }
    loadAllPosts()
  }, [postId])

  // Swipe жесты (51)
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (currentIndex > 0 && allPosts[currentIndex - 1]) {
        router.push(`/blog/${allPosts[currentIndex - 1].id}`)
      }
    },
    onSwipeRight: () => {
      if (currentIndex < allPosts.length - 1 && allPosts[currentIndex + 1]) {
        router.push(`/blog/${allPosts[currentIndex + 1].id}`)
      }
    },
    minDistance: 50,
  })

  useEffect(() => {
    const loadPost = async () => {
      try {
        // Сначала пробуем найти по ID документа
        const docRef = doc(getDb(), 'blog_posts', postId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const postData: any = { id: docSnap.id, ...docSnap.data() }
          setPost(postData)
          
          // Устанавливаем просмотры
          const postViews = postData.views || 0
          setViews(postViews)
          
          // Рассчитываем время чтения
          if (postData.content) {
            const wordsPerMinute = 200
            const words = postData.content.split(/\s+/).length
            const time = Math.ceil(words / wordsPerMinute)
            setReadingTime(time)
          } else if (postData.readTime) {
            // Если уже есть readTime, используем его
            const timeMatch = postData.readTime.match(/\d+/)
            if (timeMatch) {
              setReadingTime(parseInt(timeMatch[0]))
            }
          }
          
          // Увеличиваем просмотры (только один раз при загрузке)
          try {
            await updateDoc(docRef, {
              views: increment(1)
            })
            
            // Отслеживаем чтение блога для достижений
            await trackBlogRead()
            setViews(postViews + 1)
          } catch (error) {
            console.error('Error updating views:', error)
          }
        } else {
          // Если не найдено по ID, ищем по полю id
          const { collection, query, where, getDocs } = await import('firebase/firestore')
          const q = query(collection(getDb(), 'blog_posts'), where('id', '==', postId))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]
            const postData: any = { id: docSnap.id, ...docSnap.data() }
            setPost(postData)
            
            // Устанавливаем просмотры
            const postViews = postData.views || 0
            setViews(postViews)
            
            // Рассчитываем время чтения
            if (postData.content) {
              const wordsPerMinute = 200
              const words = postData.content.split(/\s+/).length
              const time = Math.ceil(words / wordsPerMinute)
              setReadingTime(time)
            }
            
            // Увеличиваем просмотры
            try {
              const docRef = doc(getDb(), 'blog_posts', docSnap.id)
              await updateDoc(docRef, {
                views: increment(1)
              })
              setViews(postViews + 1)
            } catch (error) {
              console.error('Error updating views:', error)
            }
          } else {
            setPost(null)
          }
        }
      } catch (error) {
        console.error('Error loading blog post:', error)
        toast.error('Ошибка загрузки статьи')
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      loadPost()
    }
  }, [postId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Загрузка статьи...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Статья не найдена</h1>
        <Link href="/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к блогу
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <ReadingProgress />
      <div 
        className="container mx-auto px-4 py-20 max-w-4xl"
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
      >
        <Breadcrumbs 
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Блог', href: '/blog' },
          ]}
          currentLabel={post?.title}
        />
        <Link href="/blog">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к блогу
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <CardTitle className="text-3xl md:text-4xl flex-1">{post.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toggleFavorite(post.id, 'blog')
                toast.success(isFavorite(post.id, 'blog') ? 'Удалено из избранного' : 'Добавлено в избранное')
              }}
              title={isFavorite(post.id, 'blog') ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <Bookmark className={`h-5 w-5 ${isFavorite(post.id, 'blog') ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
          </div>
          <CardDescription>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author === 'syyimyk' ? 'Сыймыкбек' : 'Абдыкадыр'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString('ru-RU')}
              </div>
              <span className="text-xs px-2 py-1 rounded bg-secondary">
                {post.category}
              </span>
              {readingTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} мин чтения</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{views} просмотров</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {post.content}
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-2">
            <ShareButton 
              url={`/blog/${post.id}`}
              title={post.title}
              size="sm"
            />
            <CopyButton
              text={`${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${post.id}`}
              label="Копировать ссылку"
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Комментарии */}
      <div className="mt-8">
        <CommentSection itemId={postId} itemType="blog" />
      </div>
      </div>
    </>
  )
}
