/**
 * API Client для взаимодействия с C# бэкендом
 * Использует Firebase токены для авторизации
 */

import { API_CONFIG } from './config'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private get baseUrl(): string {
    // Используем Next.js API route как прокси для обхода Mixed Content
    // Это решает проблему HTTPS -> HTTP запросов
    if (typeof window !== 'undefined') {
      // В браузере используем прокси через Next.js API
      return '/api/backend'
    }
    // На сервере используем прямой URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://213.199.56.27:5000/api'
  }

  /**
   * Получение токена для авторизации (JWT или Firebase)
   */
  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null
    }
    
    // Сначала проверяем JWT токен из localStorage (для C# backend auth)
    const jwtToken = localStorage.getItem('auth_token')
    if (jwtToken) {
      return jwtToken
    }
    
    // Fallback к Firebase token (для существующих пользователей)
    try {
      const firebaseConfig = await import('@/lib/firebase/config')
      const auth = firebaseConfig.auth
      
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken()
        return token
      }
    } catch (error) {
      console.error('[ApiClient] Error getting Firebase token:', error)
    }
    
    return null
  }

  /**
   * Базовый метод для выполнения запросов
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Проверяем, является ли body FormData
    const isFormData = options.body instanceof FormData
    
    const headers: Record<string, string> = {}
    
    // Не устанавливаем Content-Type для FormData - браузер сделает это сам с boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Добавляем пользовательские заголовки
    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>)
    }

    // Получаем токен для авторизации (JWT или Firebase)
    const authToken = await this.getAuthToken()
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 секунд для больших запросов

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        mode: 'cors', // Явно указываем CORS режим
        credentials: 'omit', // Не отправляем cookies
      })

      clearTimeout(timeoutId)

      // Проверяем, есть ли ответ вообще
      if (!response) {
        return {
          success: false,
          error: 'No response from server',
        }
      }

      const data = await response.json().catch(() => {
        // Если не JSON, возвращаем текст ошибки
        return { error: `HTTP ${response.status}: ${response.statusText}` }
      })

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error: any) {
      console.error('[ApiClient] Request failed:', {
        url,
        error: error.message,
        name: error.name,
      })

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout (30s)',
        }
      }

      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        return {
          success: false,
          error: 'Network error: Cannot connect to server. Please check your internet connection.',
        }
      }

      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  // ========== Аутентификация ==========

  /**
   * Получение URL для Google OAuth
   */
  async getGoogleAuthUrl(redirectUri: string): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>('/auth/google/url', {
      method: 'POST',
      body: JSON.stringify({ redirectUri }),
    })
  }

  /**
   * Авторизация через Google (отправка кода авторизации)
   */
  async authenticateWithGoogle(code: string, redirectUri: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request<{ token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code, redirectUri }),
    })
  }

  /**
   * Получение текущего пользователя из C# бэкенда
   * (использует JWT токен для авторизации)
   */
  async getCurrentUser() {
    return this.request<any>('/auth/me')
  }

  // ========== Курсы ==========

  /**
   * Получение всех курсов
   */
  async getCourses() {
    return this.request<any[]>('/courses')
  }

  /**
   * Получение курса по ID
   */
  async getCourse(courseId: string) {
    return this.request<any>(`/courses/${courseId}`)
  }

  // ========== Прогресс ==========

  /**
   * Получение прогресса пользователя по уроку
   */
  async getLessonProgress(lessonId: string) {
    return this.request<any>(`/progress/lesson/${lessonId}`)
  }

  /**
   * Обновление прогресса урока
   */
  async updateLessonProgress(lessonId: string, isCompleted: boolean, score: number) {
    return this.request(`/progress/lesson/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted, score }),
    })
  }

  /**
   * Получение прогресса по курсу
   */
  async getCourseProgress(courseId: string) {
    return this.request<any>(`/progress/course/${courseId}`)
  }

  // ========== Социальные функции ==========

  /**
   * Поиск пользователей
   */
  async searchUsers(query: string) {
    return this.request<any[]>(`/social/search?query=${encodeURIComponent(query)}`)
  }

  /**
   * Получение списка подписок (following)
   */
  async getFollowing(userId?: string) {
    const endpoint = userId ? `/social/following/${userId}` : '/social/following'
    return this.request<any[]>(endpoint)
  }

  /**
   * Получение списка подписчиков (followers)
   */
  async getFollowers(userId?: string) {
    const endpoint = userId ? `/social/followers/${userId}` : '/social/followers'
    return this.request<any[]>(endpoint)
  }

  /**
   * Получение данных о подписках (following + followers)
   */
  async getSubscriptionData(userId?: string) {
    const [following, followers] = await Promise.all([
      this.getFollowing(userId),
      this.getFollowers(userId),
    ])
    return {
      following: following.success ? following.data || [] : [],
      followers: followers.success ? followers.data || [] : [],
    }
  }

  /**
   * Подписка на пользователя
   */
  async followUser(userId: string) {
    return this.request(`/social/follow/${userId}`, {
      method: 'POST',
    })
  }

  /**
   * Отписка от пользователя
   */
  async unfollowUser(userId: string) {
    return this.request(`/social/unfollow/${userId}`, {
      method: 'POST',
    })
  }

  /**
   * Лайк профиля
   */
  async likeProfile(userId: string) {
    return this.request(`/social/like/${userId}`, {
      method: 'POST',
    })
  }

  /**
   * Удаление лайка
   */
  async unlikeProfile(userId: string) {
    return this.request(`/social/unlike/${userId}`, {
      method: 'POST',
    })
  }

  /**
   * Получение профиля пользователя
   */
  async getUserProfile(userId?: string) {
    const endpoint = userId ? `/social/profile/${userId}` : '/social/profile'
    return this.request<any>(endpoint)
  }

  /**
   * Обновление профиля
   */
  async updateProfile(data: { nickname?: string; bio?: string; avatar?: string; avatarUrl?: string }) {
    // Преобразуем avatar в AvatarUrl для бэкенда
    const requestData: any = {}
    if (data.nickname) requestData.nickname = data.nickname
    if (data.bio) requestData.bio = data.bio
    if (data.avatar) requestData.avatarUrl = data.avatar
    if (data.avatarUrl) requestData.avatarUrl = data.avatarUrl
    
    return this.request('/social/profile', {
      method: 'PUT',
      body: JSON.stringify(requestData),
    })
  }

  // ========== Сообщения ==========

  /**
   * Отправка сообщения в глобальный чат
   * Использует Firebase токен для авторизации
   */
  async sendGlobalMessage(content: string, file?: File) {
    const formData = new FormData()
    formData.append('content', content)
    if (file) {
      formData.append('file', file)
    }

    // Получаем Firebase токен
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request('/messages/global', {
      method: 'POST',
      headers,
      body: formData,
    })
  }

  /**
   * Отправка приватного сообщения
   * Использует Firebase токен для авторизации
   */
  async sendPrivateMessage(receiverId: string, content: string, file?: File) {
    const formData = new FormData()
    formData.append('receiverId', receiverId)
    formData.append('content', content)
    if (file) {
      formData.append('file', file)
    }

    // Получаем Firebase токен
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request('/messages/private', {
      method: 'POST',
      headers,
      body: formData,
    })
  }

  /**
   * Получение глобального чата
   */
  async getGlobalChat(limit: number = 50) {
    return this.request<any[]>(`/messages/global?limit=${limit}`)
  }

  /**
   * Получение приватных сообщений
   */
  async getPrivateChat(userId: string, limit: number = 50) {
    return this.request<any[]>(`/messages/private/${userId}?limit=${limit}`)
  }

  // ========== Загрузка файлов ==========

  /**
   * Загрузка аватара
   * Использует Firebase токен для авторизации
   */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<{ url: string }>('/upload/avatar', {
      method: 'POST',
      body: formData,
    })
  }

  /**
   * Загрузка изображения проекта
   */
  async uploadProjectImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<{ url: string }>('/upload/project-image', {
      method: 'POST',
      body: formData,
    })
  }

  /**
   * Загрузка фото отзыва
   */
  async uploadReviewPhoto(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<{ url: string }>('/upload/review-photo', {
      method: 'POST',
      body: formData,
    })
  }

  // ========== Проекты ==========

  /**
   * Получение всех проектов
   */
  async getProjects() {
    return this.request<any[]>('/projects')
  }

  /**
   * Получение проекта по ID
   */
  async getProject(projectId: string) {
    return this.request<any>(`/projects/${projectId}`)
  }

  /**
   * Создание проекта (только для админов)
   */
  async createProject(data: any) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request('/projects', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Обновление проекта (только для админов)
   */
  async updateProject(projectId: string, data: any) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Удаление проекта (только для админов)
   */
  async deleteProject(projectId: string) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
      headers,
    })
  }

  /**
   * Увеличение просмотров проекта
   */
  async incrementProjectViews(projectId: string) {
    return this.request(`/projects/${projectId}/views`, {
      method: 'POST',
    })
  }

  // ========== Блог посты ==========

  /**
   * Получение всех блог постов
   */
  async getBlogPosts() {
    return this.request<any[]>('/blog')
  }

  /**
   * Получение блог поста по ID
   */
  async getBlogPost(postId: string) {
    return this.request<any>(`/blog/${postId}`)
  }

  /**
   * Создание блог поста (только для админов)
   */
  async createBlogPost(data: any) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request('/blog', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Обновление блог поста (только для админов)
   */
  async updateBlogPost(postId: string, data: any) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/blog/${postId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Удаление блог поста (только для админов)
   */
  async deleteBlogPost(postId: string) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/blog/${postId}`, {
      method: 'DELETE',
      headers,
    })
  }

  // ========== Отзывы ==========

  /**
   * Получение всех отзывов
   */
  async getReviews() {
    return this.request<any[]>('/reviews')
  }

  /**
   * Создание отзыва
   */
  async createReview(data: {
    author: string
    project?: string
    rating: number
    text: string
    email?: string
    photoUrl?: string
  }) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request('/reviews', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Удаление отзыва (только для админов или автора)
   */
  async deleteReview(reviewId: string) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers,
    })
  }

  // ========== Заявки на проекты ==========

  /**
   * Получение всех заявок (только для админов)
   */
  async getProjectRequests() {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request<any[]>('/project-requests', {
      headers,
    })
  }

  /**
   * Создание заявки на проект
   */
  async createProjectRequest(data: {
    name: string
    email: string
    phone?: string
    projectType?: string
    description?: string
    budget?: string
    deadline?: string
  }) {
    return this.request('/project-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Обновление статуса заявки (только для админов)
   */
  async updateProjectRequestStatus(requestId: string, status: string) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/project-requests/${requestId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    })
  }

  // ========== Email подписки ==========

  /**
   * Подписка на email рассылку
   */
  async subscribeEmail(email: string) {
    return this.request('/email-subscriptions', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  /**
   * Получение всех подписок (только для админов)
   */
  async getEmailSubscriptions() {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request<any[]>('/email-subscriptions', {
      headers,
    })
  }

  // ========== Промокоды ==========

  /**
   * Получение всех активных промокодов
   */
  async getPromoCodes() {
    return this.request<any[]>('/promo-codes')
  }

  /**
   * Создание промокода (только для админов)
   */
  async createPromoCode(data: any) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request('/promo-codes', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Обновление промокода (только для админов)
   */
  async updatePromoCode(codeId: string, data: any) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/promo-codes/${codeId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })
  }

  /**
   * Удаление промокода (только для админов)
   */
  async deletePromoCode(codeId: string) {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request(`/promo-codes/${codeId}`, {
      method: 'DELETE',
      headers,
    })
  }

  /**
   * Получение статистики (для админов)
   */
  async getStats() {
      const authToken = await this.getAuthToken()
    const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

    return this.request<any>('/stats', {
      headers,
    })
  }
}

export const apiClient = new ApiClient()

