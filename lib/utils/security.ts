// Утилиты для защиты от XSS и других атак

/**
 * Экранирует HTML для защиты от XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Санитизирует строку, удаляя опасные символы
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return ''
  
  // Удаляем потенциально опасные символы
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * Валидация никнейма
 */
export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || nickname.trim().length === 0) {
    return { valid: false, error: 'Никнейм обязателен' }
  }
  
  if (nickname.length < 3) {
    return { valid: false, error: 'Никнейм должен быть не менее 3 символов' }
  }
  
  if (nickname.length > 20) {
    return { valid: false, error: 'Никнейм должен быть не более 20 символов' }
  }
  
  // Разрешаем только буквы, цифры, подчеркивания и дефисы
  if (!/^[a-zA-Zа-яА-ЯёЁ0-9_-]+$/.test(nickname)) {
    return { valid: false, error: 'Никнейм может содержать только буквы, цифры, подчеркивания и дефисы' }
  }
  
  return { valid: true }
}

/**
 * Валидация биографии
 */
export function validateBio(bio: string): { valid: boolean; error?: string } {
  if (bio && bio.length > 500) {
    return { valid: false, error: 'Биография не должна превышать 500 символов' }
  }
  
  return { valid: true }
}

/**
 * Защита от SQL инъекций (для будущего использования)
 */
export function sanitizeForDatabase(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input.replace(/['";\\]/g, '')
}

/**
 * Проверка на потенциально опасный контент
 */
export function isDangerousContent(content: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /data:text\/html/i,
    /vbscript:/i,
  ]
  
  return dangerousPatterns.some(pattern => pattern.test(content))
}






