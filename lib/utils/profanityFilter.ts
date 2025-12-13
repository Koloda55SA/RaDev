// Фильтр матов для чата

// Список запрещенных слов (можно расширить)
const PROFANITY_WORDS = [
  // Русские маты (заменены на безопасные варианты для примера)
  'бля', 'блять', 'блядь', 'хуй', 'хуйня', 'хуе', 'пизд', 'ебан', 'ебал',
  'ебану', 'ебать', 'еблан', 'ебу', 'ебут', 'заеб', 'уеб', 'ебанько',
  'ебло', 'ебля', 'ебну', 'ебнул', 'ебнула', 'ебнули', 'ебнуться',
  'сука', 'суки', 'сучара', 'сучий', 'сукин', 'сукабля',
  'гандон', 'гондон', 'мудак', 'мудаки', 'мудила', 'мудило',
  'пидор', 'пидорас', 'пидарас', 'пидорок', 'пидрила',
  'долбоеб', 'долбоёб', 'долбоящер', 'долбоящерка',
  'еблан', 'ебло', 'ебля', 'ебанутый', 'ебанутая',
  'залупа', 'залупка', 'залупень', 'залупиться',
  'заебись', 'заебал', 'заебать', 'заебали', 'заебало',
  'уебан', 'уебать', 'уебали', 'уебало',
  'выеб', 'выебать', 'выебали', 'выебало',
  'проеб', 'проебать', 'проебали', 'проебало',
  'разъеб', 'разъебать', 'разъебали', 'разъебало',
  'выебан', 'выебана', 'выебано', 'выебаны',
  'ебануть', 'ебанулся', 'ебанулась', 'ебанулись',
  'ебанутый', 'ебанутая', 'ебанутые',
  'ебануть', 'ебанулся', 'ебанулась', 'ебанулись',
  'ебанутый', 'ебанутая', 'ебанутые',
  // Английские маты
  'fuck', 'fucking', 'fucked', 'fucker', 'fuckers', 'fuckin',
  'shit', 'shitting', 'shitted', 'shitter', 'shitters',
  'asshole', 'assholes', 'ass', 'asses',
  'bitch', 'bitches', 'bitching', 'bitched',
  'damn', 'damned', 'damning',
  'crap', 'crappy', 'crappier', 'crappiest',
  'dick', 'dicks', 'dickhead', 'dickheads',
  'piss', 'pissing', 'pissed', 'pisser', 'pissers',
  'bastard', 'bastards',
  'motherfucker', 'motherfuckers', 'motherfucking',
  'cock', 'cocks', 'cocksucker', 'cocksuckers',
  'pussy', 'pussies',
  'slut', 'sluts', 'slutty',
  'whore', 'whores',
  'nigger', 'niggers', 'nigga', 'niggas', // Расистские оскорбления
  'retard', 'retarded', 'retards',
  'gay', 'gays', // В контексте оскорбления
  'lesbian', 'lesbians', // В контексте оскорбления
]

// Функция для проверки и фильтрации матов
export function filterProfanity(text: string, replaceWith: string = '***'): string {
  if (!text || typeof text !== 'string') return text
  
  let filtered = text
  const words = text.toLowerCase()
  
  // Проверяем каждое запрещенное слово
  for (const word of PROFANITY_WORDS) {
    // Создаем регулярное выражение для поиска слова (с учетом границ слов)
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*\\b`, 'gi')
    filtered = filtered.replace(regex, replaceWith)
  }
  
  return filtered
}

// Функция для проверки наличия матов (без замены)
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  
  const lowerText = text.toLowerCase()
  
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*\\b`, 'i')
    if (regex.test(lowerText)) {
      return true
    }
  }
  
  return false
}

// Функция для получения статистики фильтрации
export function getProfanityStats(text: string): { filtered: boolean; count: number; words: string[] } {
  if (!text || typeof text !== 'string') {
    return { filtered: false, count: 0, words: [] }
  }
  
  const lowerText = text.toLowerCase()
  const foundWords: string[] = []
  
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*\\b`, 'i')
    if (regex.test(lowerText)) {
      foundWords.push(word)
    }
  }
  
  return {
    filtered: foundWords.length > 0,
    count: foundWords.length,
    words: [...new Set(foundWords)] // Уникальные слова
  }
}







