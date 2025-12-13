'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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

interface BlogCardFullProps {
  post: BlogPost
}

export default function BlogCardFull({ post }: BlogCardFullProps) {
  return (
    <Card className="hover:border-primary transition-colors h-full flex flex-col">
      <CardHeader className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
            {post.category}
          </span>
        </div>
        <CardTitle className="line-clamp-2 mb-2">{post.title}</CardTitle>
        <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-secondary text-xs border border-border"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author === 'syyimyk' ? 'Сыймыкбек' : 'Абдыкадыр'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString('ru-RU')}
          </div>
          <div className="text-xs">
            {post.readTime || '5 мин'}
          </div>
        </div>
        <Link href={`/blog/${post.id}`}>
          <Button variant="outline" className="w-full">
            Читать далее
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}










