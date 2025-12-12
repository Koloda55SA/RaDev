// Система достижений

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'activity' | 'milestone' | 'special' | 'course'
  requirement: {
    type: 'stat' | 'action' | 'custom' | 'course'
    statName?: string
    value?: number
    action?: string
    courseLanguage?: string
    chapterId?: string
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  // Достижения активности
  {
    id: 'first_login',
    name: 'Первый шаг',
    description: 'Войдите в систему',
    icon: '👋',
    category: 'activity',
    requirement: { type: 'action', action: 'login' },
  },
  {
    id: 'view_10_projects',
    name: 'Любознательный',
    description: 'Просмотрите 10 проектов',
    icon: '👀',
    category: 'activity',
    requirement: { type: 'stat', statName: 'projectsViewed', value: 10 },
  },
  {
    id: 'view_50_projects',
    name: 'Исследователь',
    description: 'Просмотрите 50 проектов',
    icon: '🔍',
    category: 'activity',
    requirement: { type: 'stat', statName: 'projectsViewed', value: 50 },
  },
  {
    id: 'read_10_posts',
    name: 'Читатель',
    description: 'Прочитайте 10 статей в блоге',
    icon: '📖',
    category: 'activity',
    requirement: { type: 'stat', statName: 'blogPostsRead', value: 10 },
  },
  {
    id: 'read_50_posts',
    name: 'Книжный червь',
    description: 'Прочитайте 50 статей в блоге',
    icon: '📚',
    category: 'activity',
    requirement: { type: 'stat', statName: 'blogPostsRead', value: 50 },
  },
  {
    id: 'run_code_10',
    name: 'Программист',
    description: 'Запустите код 10 раз',
    icon: '💻',
    category: 'activity',
    requirement: { type: 'stat', statName: 'codeRuns', value: 10 },
  },
  {
    id: 'run_code_100',
    name: 'Мастер кода',
    description: 'Запустите код 100 раз',
    icon: '🚀',
    category: 'activity',
    requirement: { type: 'stat', statName: 'codeRuns', value: 100 },
  },
  {
    id: 'send_message',
    name: 'Общительный',
    description: 'Отправьте первое сообщение',
    icon: '💬',
    category: 'activity',
    requirement: { type: 'stat', statName: 'messagesSent', value: 1 },
  },
  {
    id: 'send_50_messages',
    name: 'Болтун',
    description: 'Отправьте 50 сообщений',
    icon: '🗣️',
    category: 'activity',
    requirement: { type: 'stat', statName: 'messagesSent', value: 50 },
  },
  
  // Вехи
  {
    id: 'login_10',
    name: 'Постоянный посетитель',
    description: 'Войдите 10 раз',
    icon: '⭐',
    category: 'milestone',
    requirement: { type: 'stat', statName: 'loginCount', value: 10 },
  },
  {
    id: 'login_100',
    name: 'Верный пользователь',
    description: 'Войдите 100 раз',
    icon: '🌟',
    category: 'milestone',
    requirement: { type: 'stat', statName: 'loginCount', value: 100 },
  },
  
  // Достижения курсов
  {
    id: 'first_course_lesson_complete',
    name: 'Первый урок',
    description: 'Завершите первый урок курса',
    icon: '🎯',
    category: 'course',
    requirement: { type: 'action', action: 'complete_lesson' },
  },
  // Достижения за главы будут создаваться динамически
  // Формат: chapter_complete_{language}_{chapterId}
  
  // Специальные
  {
    id: 'early_user',
    name: 'Пионер',
    description: 'Один из первых пользователей',
    icon: '🎖️',
    category: 'special',
    requirement: { type: 'custom' },
  },
  {
    id: 'profile_complete',
    name: 'Завершенный профиль',
    description: 'Настройте свой профиль',
    icon: '✅',
    category: 'special',
    requirement: { type: 'action', action: 'update_profile' },
  },
  {
    id: 'first_follow',
    name: 'Социальный',
    description: 'Подпишитесь на первого пользователя',
    icon: '👥',
    category: 'activity',
    requirement: { type: 'action', action: 'follow_user' },
  },
  {
    id: 'get_10_followers',
    name: 'Популярный',
    description: 'Получите 10 подписчиков',
    icon: '⭐',
    category: 'milestone',
    requirement: { type: 'custom' }, // Проверяется отдельно
  },
  {
    id: 'send_100_messages',
    name: 'Активный собеседник',
    description: 'Отправьте 100 сообщений',
    icon: '💬',
    category: 'activity',
    requirement: { type: 'stat', statName: 'messagesSent', value: 100 },
  },
  {
    id: 'complete_5_courses',
    name: 'Ученик',
    description: 'Завершите 5 курсов',
    icon: '📚',
    category: 'course',
    requirement: { type: 'custom' }, // Проверяется отдельно
  },
  {
    id: 'like_10_profiles',
    name: 'Дружелюбный',
    description: 'Поставьте лайки 10 профилям',
    icon: '❤️',
    category: 'activity',
    requirement: { type: 'custom' }, // Проверяется отдельно
  },
  {
    id: 'bio_added',
    name: 'Рассказчик',
    description: 'Добавьте биографию в профиль',
    icon: '📝',
    category: 'special',
    requirement: { type: 'action', action: 'add_bio' },
  },
  {
    id: 'avatar_uploaded',
    name: 'С фотографией',
    description: 'Загрузите аватарку',
    icon: '📷',
    category: 'special',
    requirement: { type: 'action', action: 'upload_avatar' },
  },
]

export function checkAchievements(
  stats: {
    projectsViewed: number
    blogPostsRead: number
    codeRuns: number
    messagesSent: number
    loginCount: number
  },
  action?: string
): string[] {
  const unlocked: string[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    const req = achievement.requirement
    
    if (req.type === 'stat' && req.statName && req.value) {
      const statValue = stats[req.statName as keyof typeof stats] || 0
      if (statValue >= req.value) {
        unlocked.push(achievement.id)
      }
    } else if (req.type === 'action' && req.action && action === req.action) {
      unlocked.push(achievement.id)
    }
  }
  
  return unlocked
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

// Функция для получения достижения за главу
export function getChapterAchievement(language: string, chapterId: string, chapterTitle: string): Achievement {
  const languageIcons: Record<string, string> = {
    python: '🐍',
    java: '☕',
    javascript: '📜',
    cpp: '⚡',
    csharp: '🔷'
  }
  
  return {
    id: `chapter_complete_${language}_${chapterId}`,
    name: `Глава: ${chapterTitle}`,
    description: `Завершите главу "${chapterTitle}" в курсе ${language}`,
    icon: languageIcons[language] || '🏆',
    category: 'course',
    requirement: { type: 'course', courseLanguage: language, chapterId },
  }
}


