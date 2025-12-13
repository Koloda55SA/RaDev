'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Ленивая загрузка полного контента
const BlogCardFull = dynamic(() => import('./BlogCardFull'), {
  loading: () => <BlogCardSkeleton />,
  ssr: false
})

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: 'syyimyk' | 'abdykadyr'
  date: string
  category: string
  readTime: string
  tags?: string[]
}

interface BlogCardLazyProps {
  post: BlogPost
}

function BlogCardSkeleton() {
  return (
    <Card>
      <Skeleton className="w-full h-48" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
    </Card>
  )
}

export default function BlogCardLazy({ post }: BlogCardLazyProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Показываем только обложку пока не кликнули
  if (!isExpanded) {
    return (
      <Card className="hover:border-primary transition-colors h-full flex flex-col cursor-pointer" onClick={() => setIsExpanded(true)}>
        <CardHeader className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
              {post.category}
            </span>
          </div>
          <CardTitle className="line-clamp-2 mb-2">{post.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm mb-4">{post.excerpt}</CardDescription>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author === 'syyimyk' ? 'Сыймыкбек' : 'Абдыкадыр'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.date).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setIsExpanded(true) }}>
            Открыть статью
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Загружаем полный контент при клике
  return <BlogCardFull post={post} />
}










