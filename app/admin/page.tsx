'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth/useAuth'
import { apiClient } from '@/lib/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, LogOut, Upload, X, Image as ImageIcon, Mail, MessageCircle, User, Send, Check, ExternalLink } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import RichTextEditor from '@/components/editor/RichTextEditor'
import dynamic from 'next/dynamic'

const CodeIDE = dynamic(() => import('@/components/ide/CodeIDE'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Загрузка редактора...</p>
      </div>
    </div>
  ),
})

export default function AdminPage() {
  const { user, userRole, loading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'projects' | 'requests' | 'reviews' | 'blogs' | 'chats' | 'stats' | 'ide'>('projects')
  const [projects, setProjects] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBlog, setIsEditingBlog] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [deleteCollection, setDeleteCollection] = useState<string | null>(null)
  const [fillDataConfirmOpen, setFillDataConfirmOpen] = useState(false)
  const [blogFormData, setBlogFormData] = useState({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    author: 'syyimyk',
    category: 'Web Development',
    readTime: '10 мин',
    date: new Date().toISOString().split('T')[0],
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: 'syyimyk',
    type: 'web',
    technologies: '',
    year: new Date().getFullYear(),
    demo: '',
    github: '',
    download: '',
    note: '',
    image: '',
  })

  useEffect(() => {
    // КРИТИЧНО: Не редиректим на login, если обрабатывается OAuth redirect
    // Проверяем наличие OAuth параметров в URL
    const hasOAuthParams = typeof window !== 'undefined' && (
      window.location.search.includes('__firebase_request_key') || 
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('id_token')
    )
    
    // Если есть OAuth параметры - ждем восстановления сессии
    if (hasOAuthParams) {
      console.log('[AdminPage] OAuth redirect detected, waiting for session restoration...')
      return
    }
    
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (userRole !== 'admin') {
        router.push('/')
        toast.error('У вас нет доступа к админ-панели')
      }
    }
  }, [user, userRole, loading, router])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['projects', 'requests', 'reviews', 'blogs', 'chats', 'stats', 'ide'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user || userRole !== 'admin') return
    
    const loadData = async () => {
      try {
        // Загружаем проекты
        const projectsResponse = await apiClient.getProjects()
        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data.map((item: any) => ({
            id: item.id || item.projectId,
            ...item,
          })))
        }

        // Загружаем заявки
        const requestsResponse = await apiClient.getProjectRequests()
        if (requestsResponse.success && requestsResponse.data) {
          setRequests(requestsResponse.data.map((item: any) => ({
            id: item.id || item.requestId,
            ...item,
          })))
        }

        // Загружаем отзывы
        const reviewsResponse = await apiClient.getReviews()
        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data.map((item: any) => ({
            id: item.id || item.reviewId,
            ...item,
          })))
        }

        // Загружаем блог посты
        const blogsResponse = await apiClient.getBlogPosts()
        if (blogsResponse.success && blogsResponse.data) {
          setBlogs(blogsResponse.data.map((item: any) => ({
            id: item.id || item.postId,
            ...item,
          })))
        }
      } catch (error) {
        console.error('Error loading admin data:', error)
        toast.error('Ошибка загрузки данных')
      }
    }

    loadData()
    
    // Polling для обновления каждые 10 секунд
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)

    // Загружаем список пользователей для чатов
    const loadChatUsers = async () => {
      if (!user) return
      
      try {
        // Загружаем всех пользователей через C# API
        const usersResponse = await apiClient.searchUsers('')
        if (usersResponse.success && usersResponse.data) {
          const allUsers = usersResponse.data
            .filter((u: any) => u.role !== 'admin' && u.email !== user?.email)
            .map((u: any) => ({
              id: u.id || u.userId,
              email: u.email || 'Неизвестный',
              ...u,
            }))
          
          // Формируем список чатов (пока без сообщений, можно добавить позже)
          const chatsWithMessages = allUsers.map((userData: any) => ({
            userId: userData.id,
            userEmail: userData.email,
            lastMessage: '',
            lastMessageTime: null,
            unreadCount: 0,
          }))
          
          setChats(chatsWithMessages)
        }
      } catch (error: any) {
        console.error('Error loading chats:', error)
        toast.error(`Ошибка загрузки чатов: ${error.message || 'Неизвестная ошибка'}`)
      }
    }

    loadChatUsers()
    
    // Polling для обновления чатов каждые 30 секунд
    const chatInterval = setInterval(loadChatUsers, 30000)
    
    return () => {
      clearInterval(chatInterval)
    }
  }, [user, userRole])

  // Функции loadProjects, loadRequests, loadReviews больше не нужны - используется real-time синхронизация

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!file) return ''
    
    try {
      setUploading(true)
      const response = await apiClient.uploadProjectImage(file)
      if (response.success && response.data?.url) {
        return response.data.url
      } else {
        throw new Error(response.error || 'Ошибка загрузки изображения')
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Ошибка загрузки изображения')
      return ''
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const imageUrl = await handleImageUpload(file)
    if (imageUrl) {
      setFormData({ ...formData, image: imageUrl })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const projectData: any = {
        title: formData.title,
        description: formData.description,
        author: formData.author,
        type: formData.type,
        technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        year: formData.year,
        updatedAt: new Date().toISOString(),
      }

      if (formData.demo) projectData.demo = formData.demo
      if (formData.github) projectData.github = formData.github
      if (formData.download) projectData.download = formData.download
      if (formData.note) projectData.note = formData.note
      if (formData.image) projectData.image = formData.image

      if (isEditing && editingId) {
        const response = await apiClient.updateProject(editingId, projectData)
        if (response.success) {
          toast.success('Проект обновлен')
          // Обновляем список
          const projectsResponse = await apiClient.getProjects()
          if (projectsResponse.success && projectsResponse.data) {
            setProjects(projectsResponse.data.map((item: any) => ({
              id: item.id || item.projectId,
              ...item,
            })))
          }
        } else {
          throw new Error(response.error || 'Ошибка обновления проекта')
        }
      } else {
        const response = await apiClient.createProject(projectData)
        if (response.success) {
          toast.success('Проект добавлен')
          // Обновляем список
          const projectsResponse = await apiClient.getProjects()
          if (projectsResponse.success && projectsResponse.data) {
            setProjects(projectsResponse.data.map((item: any) => ({
              id: item.id || item.projectId,
              ...item,
            })))
          }
        } else {
          throw new Error(response.error || 'Ошибка создания проекта')
        }
      }

      setFormData({
        title: '',
        description: '',
        author: 'syyimyk',
        type: 'web',
        technologies: '',
        year: new Date().getFullYear(),
        demo: '',
        github: '',
        download: '',
        note: '',
        image: '',
      })
      setImagePreview(null)
      setIsEditing(false)
      setEditingId(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Данные обновятся автоматически через real-time синхронизацию
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Ошибка сохранения проекта')
    }
  }

  const handleEdit = (project: any) => {
    setFormData({
      title: project.title || '',
      description: project.description || '',
      author: project.author || 'syyimyk',
      type: project.type || 'web',
      technologies: Array.isArray(project.technologies) 
        ? project.technologies.join(', ') 
        : (project.technologies || ''),
      year: project.year || new Date().getFullYear(),
      demo: project.demo || '',
      github: project.github || '',
      download: project.download || '',
      note: project.note || '',
      image: project.image || '',
    })
    setImagePreview(project.image || null)
    setIsEditing(true)
    setEditingId(project.id)
  }

  const handleDelete = async (id: string, collectionName: string) => {
    setDeleteItemId(id)
    setDeleteCollection(collectionName)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteItemId || !deleteCollection) {
      toast.error('Ошибка: не указан элемент для удаления')
      return
    }
    
    if (!user || userRole !== 'admin') {
      toast.error('У вас нет прав для удаления')
      return
    }
    
    try {
      console.log('Deleting:', deleteCollection, deleteItemId)
      
      let response
      if (deleteCollection === 'projects') {
        response = await apiClient.deleteProject(deleteItemId)
      } else if (deleteCollection === 'blog_posts') {
        response = await apiClient.deleteBlogPost(deleteItemId)
      } else if (deleteCollection === 'reviews') {
        response = await apiClient.deleteReview(deleteItemId)
      } else {
        toast.error('Неподдерживаемая коллекция')
        setDeleteConfirmOpen(false)
        return
      }
      
      if (response.success) {
        toast.success('✅ Удалено успешно')
        
        // Обновляем списки
        if (deleteCollection === 'projects') {
          const projectsResponse = await apiClient.getProjects()
          if (projectsResponse.success && projectsResponse.data) {
            setProjects(projectsResponse.data.map((item: any) => ({
              id: item.id || item.projectId,
              ...item,
            })))
          }
        } else if (deleteCollection === 'blog_posts') {
          const blogsResponse = await apiClient.getBlogPosts()
          if (blogsResponse.success && blogsResponse.data) {
            setBlogs(blogsResponse.data.map((item: any) => ({
              id: item.id || item.postId,
              ...item,
            })))
          }
        } else if (deleteCollection === 'reviews') {
          const reviewsResponse = await apiClient.getReviews()
          if (reviewsResponse.success && reviewsResponse.data) {
            setReviews(reviewsResponse.data.map((item: any) => ({
              id: item.id || item.reviewId,
              ...item,
            })))
          }
        }
      } else {
        throw new Error(response.error || 'Ошибка удаления')
      }
      
      setDeleteConfirmOpen(false)
      setDeleteItemId(null)
      setDeleteCollection(null)
    } catch (error: any) {
      console.error('Error deleting:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      toast.error(`Ошибка удаления: ${error.message || error.code || 'Неизвестная ошибка'}`)
      setDeleteConfirmOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const blogData: any = {
        title: blogFormData.title,
        excerpt: blogFormData.excerpt,
        content: blogFormData.content,
        author: blogFormData.author,
        category: blogFormData.category,
        readTime: blogFormData.readTime,
        date: blogFormData.date,
        createdAt: new Date().toISOString(),
      }

      let blogId: string
      if (isEditingBlog && editingBlogId) {
        const response = await apiClient.updateBlogPost(editingBlogId, blogData)
        if (response.success) {
          blogId = editingBlogId
          toast.success('Блог обновлен')
          // Обновляем список
          const blogsResponse = await apiClient.getBlogPosts()
          if (blogsResponse.success && blogsResponse.data) {
            setBlogs(blogsResponse.data.map((item: any) => ({
              id: item.id || item.postId,
              ...item,
            })))
          }
        } else {
          throw new Error(response.error || 'Ошибка обновления блога')
        }
      } else {
        const response = await apiClient.createBlogPost(blogData)
        if (response.success && response.data) {
          blogId = (response.data as any).id || (response.data as any).postId || ''
          toast.success('Блог добавлен')
          
          // Обновляем список
          const blogsResponse = await apiClient.getBlogPosts()
          if (blogsResponse.success && blogsResponse.data) {
            setBlogs(blogsResponse.data.map((item: any) => ({
              id: item.id || item.postId,
              ...item,
            })))
          }
          
          // Отправляем email подписчикам при создании нового блога
          try {
            const subscribersResponse = await apiClient.getEmailSubscriptions()
            if (subscribersResponse.success && subscribersResponse.data) {
              const activeSubscribers = subscribersResponse.data
                .filter((sub: any) => sub.subscribed !== false)
                .map((sub: any) => sub.email)
              
              if (activeSubscribers.length > 0) {
                // Вызываем API route для отправки email
                const emailResponse = await fetch('/api/send-blog-notification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    blogTitle: blogData.title,
                    blogExcerpt: blogData.excerpt,
                    blogId: blogId,
                    subscribers: activeSubscribers,
                  }),
                })
                
                if (!emailResponse.ok) {
                  console.error('Failed to send email notifications')
                }
              }
            }
          } catch (emailError) {
            console.error('Error sending email notifications:', emailError)
            // Не показываем ошибку пользователю, так как блог уже сохранен
          }
        } else {
          throw new Error(response.error || 'Ошибка создания блога')
        }
      }

      setBlogFormData({
        id: '',
        title: '',
        excerpt: '',
        content: '',
        author: 'syyimyk',
        category: 'Web Development',
        readTime: '10 мин',
        date: new Date().toISOString().split('T')[0],
      })
      setIsEditingBlog(false)
      setEditingBlogId(null)
    } catch (error) {
      console.error('Error saving blog:', error)
      toast.error('Ошибка сохранения блога')
    }
  }

  const handleEditBlog = (blog: any) => {
    setBlogFormData({
      id: blog.id || '',
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author: blog.author || 'syyimyk',
      category: blog.category || 'Web Development',
      readTime: blog.readTime || '10 мин',
      date: blog.date ? blog.date.split('T')[0] : new Date().toISOString().split('T')[0],
    })
    setIsEditingBlog(true)
    setEditingBlogId(blog.id)
  }

  const removeImage = () => {
    setFormData({ ...formData, image: '' })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !selectedChat || !user) return

    try {
      const chatUser = chats.find(c => c.userId === selectedChat)
      if (!chatUser) return

      const response = await apiClient.sendPrivateMessage(selectedChat, chatInput)
      if (response.success) {
        setChatInput('')
        toast.success('Сообщение отправлено')
        // Обновляем сообщения
        const messagesResponse = await apiClient.getPrivateChat(selectedChat, 100)
        if (messagesResponse.success && messagesResponse.data) {
          const messagesData = messagesResponse.data.map((msg: any) => ({
            id: msg.id || msg.messageId,
            ...msg,
          }))
          setChatMessages(messagesData)
        }
      } else {
        throw new Error(response.error || 'Ошибка отправки сообщения')
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || 'Ошибка отправки сообщения')
    }
  }

  useEffect(() => {
    if (!selectedChat || !user) return

    const loadMessages = async () => {
      try {
        const response = await apiClient.getPrivateChat(selectedChat, 100)
        if (response.success && response.data) {
          const messagesData = response.data.map((msg: any) => ({
            id: msg.id || msg.messageId,
            text: msg.content || msg.text || '',
            senderId: msg.senderId || msg.sender?.id,
            senderEmail: msg.senderEmail || msg.sender?.email || '',
            receiverId: msg.receiverId || selectedChat,
            receiverEmail: msg.receiverEmail || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            read: msg.read || false,
            imageUrl: msg.fileUrl || msg.imageUrl,
            code: msg.code,
            codeLanguage: msg.codeLanguage,
          }))
          setChatMessages(messagesData)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
    
    // Polling для обновления каждые 3 секунды
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [selectedChat, user])

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Загрузка...</div>
  }

  if (!user || userRole !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold glow-blue mb-2">Админ-панель</h1>
            <p className="text-lg text-muted-foreground">Управление контентом сайта</p>
          </div>
          <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setFillDataConfirmOpen(true)}
          >
            Заполнить данные
          </Button>
          <ConfirmDialog
            open={fillDataConfirmOpen}
            onOpenChange={setFillDataConfirmOpen}
            title="Заполнить начальными данными?"
            description="Это добавит 3 проекта и 6 блогов в базу данных."
            confirmText="Заполнить"
            cancelText="Отмена"
            onConfirm={async () => {
              try {
                // Добавляем проекты
                const projects = [
                  {
                    title: 'KimeCosmicMall',
                    description: 'Интернет-магазин модной женской одежды. Полнофункциональный веб-сайт с каталогом товаров, корзиной и системой заказов.',
                    author: 'syyimyk',
                    type: 'web',
                    technologies: ['Next.js', 'React', 'TypeScript', 'Firebase'],
                    year: 2024,
                    demo: 'https://kimecosmicmall.vercel.app',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    title: 'GameGift.live',
                    description: 'Приложение для записи к стоматологу. Включает веб-сайт и Android приложение для удобной записи на прием к стоматологу.',
                    author: 'syyimyk',
                    type: 'web',
                    technologies: ['Next.js', 'React', 'Android', 'Kotlin'],
                    year: 2024,
                    demo: 'https://gamegift.live',
                    download: 'https://gamegift.live/app.apk',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    title: 'Dreamon - AI Примерочная',
                    description: 'Современное мобильное приложение для покупки одежды с AI примерочной. Включает каталог товаров, историю образов и чат с поддержкой.',
                    author: 'syyimyk',
                    type: 'web',
                    technologies: ['Next.js', 'React', 'AI', 'Machine Learning'],
                    year: 2024,
                    demo: 'https://website-theta-one-41.vercel.app',
                    note: 'В разработке',
                    createdAt: new Date().toISOString(),
                  },
                ]

                for (const project of projects) {
                  await apiClient.createProject(project)
                }

                // Добавляем блоги
                const today = new Date().toISOString().split('T')[0]
                const blogs = [
                  {
                    id: '1',
                    title: 'Как мы создали KimeCosmicMall - интернет-магазин под ключ',
                    excerpt: 'Рассказываем о процессе разработки полнофункционального интернет-магазина модной женской одежды. От идеи до запуска: архитектура, выбор технологий и решение сложных задач.',
                    content: `# Как мы создали KimeCosmicMall - интернет-магазин под ключ\n\n## Введение\n\nKimeCosmicMall - это полнофункциональный интернет-магазин модной женской одежды, который мы разработали с нуля.\n\n## Выбор технологий\n\nДля этого проекта мы выбрали:\n- **Next.js 14** - для серверного рендеринга\n- **React** - для интерактивного UI\n- **TypeScript** - для типобезопасности\n- **Firebase** - для backend\n\n## Результат\n\nПроект успешно запущен и работает на https://kimecosmicmall.vercel.app`,
                    author: 'syyimyk',
                    date: today,
                    category: 'Web Development',
                    readTime: '12 мин',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    title: 'GameGift.live - приложение для записи к стоматологу',
                    excerpt: 'История разработки веб-сайта и Android приложения для удобной записи на прием к стоматологу.',
                    content: `# GameGift.live - приложение для записи к стоматологу\n\n## О проекте\n\nGameGift.live - это веб-сайт и Android приложение для удобной записи на прием к стоматологу.\n\n## Функционал\n\n- Онлайн-запись на прием\n- Выбор удобного времени\n- Уведомления о записи\n\nПроект доступен на https://gamegift.live`,
                    author: 'syyimyk',
                    date: today,
                    category: 'Mobile Development',
                    readTime: '10 мин',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: '3',
                    title: 'Dreamon - AI примерочная: будущее онлайн-шопинга',
                    excerpt: 'Разработка мобильного приложения с AI примерочной для покупки одежды.',
                    content: `# Dreamon - AI примерочная\n\n## Концепция\n\nDreamon - это современное мобильное приложение для покупки одежды с AI примерочной.\n\n## Возможности\n\n- AI Примерочная\n- Каталог товаров\n- История образов\n- Чат с поддержкой\n\nПроект доступен на https://website-theta-one-41.vercel.app`,
                    author: 'syyimyk',
                    date: today,
                    category: 'AI & Machine Learning',
                    readTime: '15 мин',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: '4',
                    title: 'Советы по выбору технологий для вашего проекта',
                    excerpt: 'Когда использовать React, Next.js, React Native или Flutter?',
                    content: `# Советы по выбору технологий\n\n## Введение\n\nВыбор правильных технологий - это один из самых важных решений.\n\n## Веб-разработка\n\n**React** - лучший выбор если нужна гибкость.\n\n**Vue** - подходит когда нужна простота.\n\n**Angular** - выбирайте если нужна строгая архитектура.`,
                    author: 'syyimyk',
                    date: today,
                    category: 'Development Tips',
                    readTime: '8 мин',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: '5',
                    title: 'Как правильно написать дипломную работу по программированию',
                    excerpt: 'Пошаговое руководство по написанию дипломной работы.',
                    content: `# Как правильно написать дипломную работу\n\n## Введение\n\nДипломная работа - это финальный этап обучения.\n\n## Этап 1: Выбор темы\n\nВыбирайте тему, которая вам интересна.\n\n## Этап 2: Планирование\n\nРазработайте подробный план работы.\n\n## Заключение\n\nЕсли нужна помощь - обращайтесь к нам!`,
                    author: 'syyimyk',
                    date: today,
                    category: 'Education',
                    readTime: '20 мин',
                    createdAt: new Date().toISOString(),
                  },
                  {
                    id: '6',
                    title: 'Разработка мобильных приложений: с чего начать',
                    excerpt: 'Основы разработки мобильных приложений для начинающих.',
                    content: `# Разработка мобильных приложений: с чего начать\n\n## Введение\n\nМобильная разработка - одна из самых быстрорастущих областей.\n\n## Выбор платформы\n\n**iOS разработка:**\n- Язык: Swift\n- Инструменты: Xcode\n\n**Android разработка:**\n- Язык: Kotlin\n- Инструменты: Android Studio\n\n## Заключение\n\nНачните с основ и практикуйтесь регулярно!`,
                    author: 'abdykadyr',
                    date: today,
                    category: 'Mobile Development',
                    readTime: '10 мин',
                    createdAt: new Date().toISOString(),
                  },
                ]

                for (const blog of blogs) {
                  await apiClient.createBlogPost(blog)
                }

                toast.success('✅ Начальные данные добавлены!')
              } catch (error) {
                console.error('Error seeding data:', error)
                toast.error('Ошибка при заполнении данных')
              }
            }}
          />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-border pb-2 overflow-x-auto">
        <Button
          variant={activeTab === 'projects' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('projects')}
          size="lg"
          className="text-base px-6 py-3 min-w-[140px]"
        >
          📁 Проекты ({projects.length})
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('requests')}
          size="lg"
          className="text-base px-6 py-3 min-w-[140px]"
        >
          📋 Заявки ({requests.filter((r: any) => r.status === 'new').length})
        </Button>
        <Button
          variant={activeTab === 'reviews' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('reviews')}
          size="lg"
          className="text-base px-6 py-3 min-w-[140px]"
        >
          ⭐ Отзывы ({reviews.length})
        </Button>
        <Button
          variant={activeTab === 'blogs' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('blogs')}
          size="lg"
          className="text-base px-6 py-3 min-w-[140px]"
        >
          📝 Блоги ({blogs.length})
        </Button>
        <Button
          variant={activeTab === 'chats' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('chats')}
          size="lg"
          className="text-base px-6 py-3 min-w-[140px]"
        >
          💬 Чаты ({chats.length})
        </Button>
        <Button
          variant={activeTab === 'ide' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('ide')}
          size="lg"
          className="text-base px-6 py-3 min-w-[140px]"
        >
          💻 IDE
        </Button>
      </div>

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="xl:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{isEditing ? '✏️ Редактировать проект' : '➕ Добавить проект'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="title" className="text-base mb-2 block font-semibold">Название *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Название проекта"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-base mb-2 block font-semibold">Описание *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={5}
                      placeholder="Описание проекта"
                      className="text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Автор *</Label>
                    <select
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="syyimyk">Сыймыкбек</option>
                      <option value="abdykadyr">Абдыкадыр</option>
                      <option value="both">Оба</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="type">Тип *</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="web">Веб</option>
                      <option value="mobile">Мобильное</option>
                      <option value="desktop">Десктоп</option>
                      <option value="diploma">Диплом</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="technologies">Технологии (через запятую) *</Label>
                    <Input
                      id="technologies"
                      value={formData.technologies}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                      required
                      placeholder="React, Next.js, TypeScript"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Год *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      required
                      min="2020"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo">Демо (URL)</Label>
                    <Input
                      id="demo"
                      type="url"
                      value={formData.demo}
                      onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub (URL)</Label>
                    <Input
                      id="github"
                      type="url"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="download">Скачать (URL)</Label>
                    <Input
                      id="download"
                      type="url"
                      value={formData.download}
                      onChange={(e) => setFormData({ ...formData, download: e.target.value })}
                      placeholder="https://example.com/download"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note">Примечание</Label>
                    <Input
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Например: В разработке"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Изображение</Label>
                    <div className="space-y-2">
                      {(imagePreview || formData.image) && (
                        <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview || formData.image}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <p className="text-xs text-muted-foreground">Загрузка изображения...</p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={uploading} size="lg">
                    {uploading ? '⏳ Загрузка...' : isEditing ? '💾 Обновить проект' : '➕ Добавить проект'}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsEditing(false)
                        setEditingId(null)
                        setFormData({
                          title: '',
                          description: '',
                          author: 'syyimyk',
                          type: 'web',
                          technologies: '',
                          year: new Date().getFullYear(),
                          demo: '',
                          github: '',
                          download: '',
                          note: '',
                          image: '',
                        })
                        setImagePreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      Отмена
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">📁 Список проектов ({projects.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Проектов пока нет. Добавьте первый проект!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="flex gap-4">
                          {project.image && (
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="text-xs px-2 py-1 rounded bg-secondary">
                                {project.type}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-secondary">
                                {project.author === 'syyimyk' ? 'Сыймыкбек' : project.author === 'abdykadyr' ? 'Абдыкадыр' : 'Оба'}
                              </span>
                              {project.note && (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">
                                  {project.note}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {project.demo && (
                                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                  Демо →
                                </a>
                              )}
                              {project.github && (
                                <a href={project.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                  GitHub →
                                </a>
                              )}
                              {project.download && (
                                <a href={project.download} className="hover:text-primary">
                                  Скачать →
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(project)}
                              title="Редактировать"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(project.id, 'projects')}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Новые заявки */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">🔴 Новые заявки ({requests.filter((r: any) => r.status === 'new').length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {requests.filter((r: any) => r.status === 'new').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Новых заявок нет
                </p>
              ) : (
                <div className="space-y-4">
                  {requests.filter((r: any) => r.status === 'new').map((request: any) => {
                    // Определяем имя админа по email
                    const adminName = user?.email === 'oon66517@gmail.com' 
                      ? 'Рахманов Сыймыкбек' 
                      : user?.email === 'ns.zynk.gamer@gmail.com'
                      ? 'Абдырахманов Абдыкадыр'
                      : 'Администратор'
                    
                    // Генерируем Telegram ссылку
                    const generateTelegramLink = () => {
                      if (!request.telegram) return ''
                      const telegramUsername = request.telegram.replace('@', '')
                      const message = encodeURIComponent(`Привет! Мы компания R&A-Dev, давай обсудим твой проект. Я ${adminName}.`)
                      return `https://t.me/${telegramUsername}?text=${message}`
                    }

                    return (
                      <div
                        key={request.id}
                        className="p-4 border-2 border-red-500 rounded-lg hover:border-red-600 transition-colors bg-red-500/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <h3 className="font-semibold">{request.name}</h3>
                              <span className="text-xs px-2 py-1 rounded bg-red-500 text-white">Новая</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${request.email}`} className="text-sm text-primary hover:underline">
                                {request.email}
                              </a>
                            </div>
                            {request.telegram && (
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{request.telegram}</span>
                                {generateTelegramLink() && (
                                  <a
                                    href={generateTelegramLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Написать в Telegram
                                  </a>
                                )}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                              {request.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                if (!request.id) {
                                  toast.error('Ошибка: ID заявки не найден')
                                  return
                                }
                                try {
                                  const telegramLink = generateTelegramLink()
                                  const updateData: any = {
                                    status: 'accepted',
                                    acceptedBy: user?.email || 'admin',
                                    acceptedAt: new Date().toISOString(),
                                  }
                                  if (telegramLink) {
                                    updateData.telegramLink = telegramLink
                                  }
                                  await apiClient.updateProjectRequestStatus(request.id, 'accepted')
                                  toast.success('✅ Заявка принята!')
                                  // Обновляем список заявок
                                  const requestsResponse = await apiClient.getProjectRequests()
                                  if (requestsResponse.success && requestsResponse.data) {
                                    setRequests(requestsResponse.data.map((item: any) => ({
                                      id: item.id || item.requestId,
                                      ...item,
                                    })))
                                  }
                                } catch (error: any) {
                                  console.error('Error accepting request:', error)
                                  toast.error(`Ошибка при принятии заявки: ${error.message || 'Неизвестная ошибка'}`)
                                }
                              }}
                              className="whitespace-nowrap"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Принять
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(request.id, 'project_requests')}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* История заявок */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">📜 История заявок ({requests.filter((r: any) => r.status !== 'new').length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {requests.filter((r: any) => r.status !== 'new').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  История пуста
                </p>
              ) : (
                <div className="space-y-4">
                  {requests.filter((r: any) => r.status !== 'new').map((request: any) => (
                    <div
                      key={request.id}
                      className="p-4 border border-border rounded-lg hover:border-primary transition-colors opacity-75"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{request.name}</h3>
                            <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">Принята</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${request.email}`} className="text-sm text-primary hover:underline">
                              {request.email}
                            </a>
                          </div>
                          {request.telegram && (
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{request.telegram}</span>
                              {request.telegramLink && (
                                <a
                                  href={request.telegramLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Telegram ссылка
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                            {request.message}
                          </p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Создана: {new Date(request.createdAt).toLocaleString('ru-RU')}</span>
                            {request.acceptedAt && (
                              <span>Принята: {new Date(request.acceptedAt).toLocaleString('ru-RU')}</span>
                            )}
                            {request.acceptedBy && (
                              <span>Админ: {request.acceptedBy}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(request.id, 'project_requests')}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reviews' && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">⭐ Отзывы ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Отзывов пока нет
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{review.author}</h3>
                        {review.project && (
                          <p className="text-sm text-muted-foreground mb-2">{review.project}</p>
                        )}
                        <p className="text-sm mb-2">{review.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(review.id, 'reviews')}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'blogs' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="xl:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{isEditingBlog ? '✏️ Редактировать блог' : '➕ Добавить блог'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBlogSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="blog-title" className="text-base mb-2 block font-semibold">Название *</Label>
                    <Input
                      id="blog-title"
                      value={blogFormData.title}
                      onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                      required
                      placeholder="Название блога"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog-excerpt" className="text-base mb-2 block font-semibold">Краткое описание *</Label>
                    <Textarea
                      id="blog-excerpt"
                      value={blogFormData.excerpt}
                      onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                      required
                      rows={4}
                      placeholder="Краткое описание"
                      className="text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog-content" className="text-base mb-2 block font-semibold">Содержание *</Label>
                    <RichTextEditor
                      content={blogFormData.content}
                      onChange={(content) => setBlogFormData({ ...blogFormData, content })}
                      placeholder="Начните писать статью..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog-author" className="text-base mb-2 block font-semibold">Автор *</Label>
                    <select
                      id="blog-author"
                      value={blogFormData.author}
                      onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                      required
                    >
                      <option value="syyimyk">Сыймыкбек</option>
                      <option value="abdykadyr">Абдыкадыр</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="blog-category" className="text-base mb-2 block font-semibold">Категория *</Label>
                    <Input
                      id="blog-category"
                      value={blogFormData.category}
                      onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                      required
                      placeholder="Web Development"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog-readTime" className="text-base mb-2 block font-semibold">Время чтения *</Label>
                    <Input
                      id="blog-readTime"
                      value={blogFormData.readTime}
                      onChange={(e) => setBlogFormData({ ...blogFormData, readTime: e.target.value })}
                      required
                      placeholder="10 мин"
                      className="h-11 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blog-date" className="text-base mb-2 block font-semibold">Дата *</Label>
                    <Input
                      id="blog-date"
                      type="date"
                      value={blogFormData.date}
                      onChange={(e) => setBlogFormData({ ...blogFormData, date: e.target.value })}
                      required
                      className="h-11 text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg">
                    {isEditingBlog ? '💾 Обновить блог' : '➕ Добавить блог'}
                  </Button>
                  {isEditingBlog && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsEditingBlog(false)
                        setEditingBlogId(null)
                        setBlogFormData({
                          id: '',
                          title: '',
                          excerpt: '',
                          content: '',
                          author: 'syyimyk',
                          category: 'Web Development',
                          readTime: '10 мин',
                          date: new Date().toISOString().split('T')[0],
                        })
                      }}
                    >
                      Отмена
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">📝 Список блогов ({blogs.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {blogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Блогов пока нет
                  </p>
                ) : (
                  <div className="space-y-4">
                    {blogs.map((blog) => (
                      <div
                        key={blog.id}
                        className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {blog.excerpt}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>{blog.category}</span>
                              <span>•</span>
                              <span>{blog.readTime}</span>
                              <span>•</span>
                              <span>{new Date(blog.date).toLocaleDateString('ru-RU')}</span>
                              <span>•</span>
                              <span>{blog.author === 'syyimyk' ? 'Сыймыкбек' : 'Абдыкадыр'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditBlog(blog)}
                              title="Редактировать"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(blog.id, 'blog_posts')}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'ide' && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">💻 Онлайн IDE</CardTitle>
            <CardDescription>
              Полноценный редактор кода с компиляцией, файловой системой и терминалом
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
              <CodeIDE
                onSave={(files) => {
                  localStorage.setItem('ide_files', JSON.stringify(files))
                  toast.success('Файлы сохранены')
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="xl:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">👥 Пользователи</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {chats.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Нет сообщений от пользователей
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.userId}
                        className={`p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                          selectedChat === chat.userId ? 'border-primary bg-primary/10' : ''
                        } ${chat.unreadCount > 0 ? 'border-red-500 bg-red-500/5' : ''}`}
                        onClick={() => setSelectedChat(chat.userId)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{chat.userEmail}</p>
                              {chat.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                            {chat.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {chat.lastMessage}
                              </p>
                            )}
                            {chat.lastMessageTime && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {chat.lastMessageTime.toDate().toLocaleString('ru-RU', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-1">
            <Card className="h-[calc(100vh-200px)] flex flex-col shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">
                  {selectedChat ? `💬 Чат с ${chats.find(c => c.userId === selectedChat)?.userEmail}` : '👤 Выберите пользователя'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                {selectedChat ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 overscroll-contain" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          Нет сообщений. Начните общение!
                        </div>
                      ) : (
                        chatMessages.map((message: any) => {
                          const userId = (user as any)?.uid || (user as any)?.id
                          const isAdmin = message.senderId === userId
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 break-words ${
                                  isAdmin
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {message.timestamp?.toDate().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Textarea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendChatMessage()
                            }
                          }}
                          placeholder="Введите сообщение..."
                          className="min-h-[60px] max-h-[120px] resize-none"
                          rows={2}
                        />
                        <Button onClick={handleSendChatMessage} size="icon" disabled={!chatInput.trim()} className="self-end">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Выберите пользователя для начала чата</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Всего проектов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{projects.length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {projects.filter((p: any) => p.type === 'web').length} веб, {projects.filter((p: any) => p.type === 'mobile').length} мобильных
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Новые заявки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{requests.filter((r: any) => r.status === 'new').length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Всего заявок: {requests.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Отзывы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{reviews.length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Средняя оценка: {reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) : '0'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Активные чаты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{chats.length}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Всего сообщений: {chatMessages.length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Модальные окна подтверждения */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Подтвердите удаление"
        description="Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
    </div>
  )
}