'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Trash2, Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/components/auth/useAuth'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface Review {
  id: string
  author: string
  project: string
  rating: number
  text: string
  date: string
  email?: string
  photoUrl?: string
  verified?: boolean
}

export default function ReviewsPage() {
  const { t } = useTranslation()
  const { user, userRole } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    author: '',
    project: '',
    rating: 5,
    text: '',
    email: '',
    photo: null as File | null,
  })

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await apiClient.getReviews()
        if (response.success && response.data) {
          const reviewsData = response.data.map((item: any) => ({
            id: item.id || item.reviewId,
            author: item.author || '',
            project: item.project || '',
            rating: item.rating || 5,
            text: item.text || '',
            date: item.createdAt || item.date || new Date().toISOString(),
            email: item.email,
            photoUrl: item.photoUrl,
            verified: item.verified || false,
          })) as Review[]
          
          // Сортируем по дате (новые первые)
          reviewsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          
          setReviews(reviewsData)
        } else {
          setReviews([])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error loading reviews:', error)
        toast.error('Ошибка загрузки отзывов')
        setLoading(false)
      }
    }

    loadReviews()
    
    // Polling для обновления каждые 30 секунд
    const interval = setInterval(loadReviews, 30000)
    return () => clearInterval(interval)
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Фото должно быть меньше 5MB')
        return
      }
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let photoUrl = ''
      if (formData.photo) {
        const response = await apiClient.uploadReviewPhoto(formData.photo)
        if (response.success && response.data?.url) {
          photoUrl = response.data.url
        } else {
          throw new Error(response.error || 'Ошибка загрузки фото')
        }
      }

      const response = await apiClient.createReview({
        author: formData.author,
        project: formData.project || undefined,
        rating: formData.rating,
        text: formData.text,
        email: user?.email || formData.email || undefined,
        photoUrl: photoUrl || undefined,
      })

      if (response.success) {
        toast.success('Отзыв добавлен!')
        setFormData({
          author: '',
          project: '',
          rating: 5,
          text: '',
          email: '',
          photo: null,
        })
        setPhotoPreview(null)
        setShowForm(false)
        // Перезагружаем отзывы
        const reviewsResponse = await apiClient.getReviews()
        if (reviewsResponse.success && reviewsResponse.data) {
          const reviewsData = reviewsResponse.data.map((item: any) => ({
            id: item.id || item.reviewId,
            author: item.author || '',
            project: item.project || '',
            rating: item.rating || 5,
            text: item.text || '',
            date: item.createdAt || item.date || new Date().toISOString(),
            email: item.email,
            photoUrl: item.photoUrl,
            verified: item.verified || false,
          })) as Review[]
          reviewsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setReviews(reviewsData)
        }
      } else {
        throw new Error(response.error || 'Ошибка добавления отзыва')
      }
    } catch (error: any) {
      console.error('Error adding review:', error)
      toast.error(error.message || 'Ошибка добавления отзыва')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return
    try {
      const response = await apiClient.deleteReview(id)
      if (response.success) {
        toast.success('Отзыв удален')
        // Обновляем список отзывов
        const reviewsResponse = await apiClient.getReviews()
        if (reviewsResponse.success && reviewsResponse.data) {
          const reviewsData = reviewsResponse.data.map((item: any) => ({
            id: item.id || item.reviewId,
            author: item.author || '',
            project: item.project || '',
            rating: item.rating || 5,
            text: item.text || '',
            date: item.createdAt || item.date || new Date().toISOString(),
            email: item.email,
            photoUrl: item.photoUrl,
            verified: item.verified || false,
          })) as Review[]
          reviewsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setReviews(reviewsData)
        }
      } else {
        throw new Error(response.error || 'Ошибка удаления отзыва')
      }
    } catch (error: any) {
      console.error('Error deleting review:', error)
      toast.error(error.message || 'Ошибка удаления отзыва')
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 px-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-blue">
          {t('reviews.title') || 'Отзывы'}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4">
          {t('reviews.subtitle') || 'Что говорят наши клиенты'}
        </p>
        {reviews.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">({reviews.length} отзывов)</span>
          </div>
        )}
      </motion.div>

      {!showForm && (
        <div className="text-center mb-8">
          <Button onClick={() => setShowForm(true)} variant="neon" size="lg">
            Оставить отзыв
          </Button>
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Добавить отзыв</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Ваше имя *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="project">Проект (необязательно)</Label>
                    <Input
                      id="project"
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      placeholder="Название проекта"
                    />
                  </div>
                </div>
                {!user && (
                  <div>
                    <Label htmlFor="email">Email (необязательно)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="rating">Оценка *</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= formData.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="text">Текст отзыва *</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="photo">Фото (необязательно, макс. 5MB)</Label>
                  <div className="mt-2">
                    {photoPreview ? (
                      <div className="relative inline-block">
                        <Image
                          src={photoPreview}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null)
                            setFormData({ ...formData, photo: null })
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 p-4 border border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-5 w-5" />
                        <span>Загрузить фото</span>
                        <input
                          type="file"
                          id="photo"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Отправка...' : 'Отправить отзыв'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false)
                    setFormData({
                      author: '',
                      project: '',
                      rating: 5,
                      text: '',
                      email: '',
                      photo: null,
                    })
                    setPhotoPreview(null)
                  }}>
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Отзывов пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{review.author}</CardTitle>
                        {review.verified && (
                          <div title="Проверенный клиент">
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                      </div>
                      {review.project && (
                        <p className="text-sm text-muted-foreground mb-2">Проект: {review.project}</p>
                      )}
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(review.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    {userRole === 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(review.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {review.photoUrl && (
                    <div className="mb-4">
                      <Image
                        src={review.photoUrl}
                        alt={review.author}
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{review.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
