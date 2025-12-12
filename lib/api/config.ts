/**
 * Конфигурация API
 * C# бэкенд используется для всех функций кроме аутентификации
 * Аутентификация всегда через Firebase
 */

// C# API используется для данных (чаты, профили, файлы и т.д.)
export const USE_API_BACKEND = process.env.NEXT_PUBLIC_USE_API_BACKEND !== 'false'

/**
 * Получить URL API
 * В браузере используем Next.js API route как прокси
 * На сервере используем прямой URL
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // В браузере используем прокси через Next.js API для обхода Mixed Content
    return '/api/backend'
  }
  // На сервере используем прямой URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://213.199.56.27:5000/api'
}

export const API_CONFIG = {
  // Таймаут запросов
  timeout: 10000, // 10 секунд
}

/**
 * Проверка доступности API
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const apiUrl = getApiUrl()
    const healthUrl = `${apiUrl.replace('/api', '')}/health`
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

