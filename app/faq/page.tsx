'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Что такое R&A-Dev?',
    answer: 'R&A-Dev - это образовательная платформа для изучения программирования и социальная сеть для IT-специалистов. Мы предлагаем бесплатные курсы по 5 языкам программирования (Python, JavaScript, Java, C++, C#), а также услуги по разработке сайтов, приложений и дипломных работ.',
    category: 'О платформе',
  },
  {
    id: '2',
    question: 'Курсы действительно бесплатные?',
    answer: 'Да, все курсы программирования на платформе полностью бесплатны. Вы можете изучать Python, JavaScript, Java, C++ и C# с нуля до продвинутого уровня без каких-либо платежей.',
    category: 'Курсы',
  },
  {
    id: '3',
    question: 'Как начать обучение?',
    answer: 'Просто перейдите на страницу /courses, выберите интересующий вас язык программирования и начните с первого урока. Каждый курс включает теорию, практические задания с автоматической проверкой и тесты.',
    category: 'Курсы',
  },
  {
    id: '4',
    question: 'Нужно ли регистрироваться для прохождения курсов?',
    answer: 'Да, регистрация обязательна для сохранения прогресса, получения достижений и доступа к социальным функциям платформы. Регистрация бесплатна и занимает всего несколько секунд.',
    category: 'Курсы',
  },
  {
    id: '5',
    question: 'Что такое социальная сеть R&A-Dev?',
    answer: 'R&A-Dev - это не только образовательная платформа, но и социальная сеть для программистов. Вы можете общаться с другими пользователями, обмениваться сообщениями с кодом и фотографиями, подписываться на интересных людей, просматривать их достижения и прогресс в обучении.',
    category: 'Социальная сеть',
  },
  {
    id: '6',
    question: 'Сколько стоит разработка сайта?',
    answer: 'Стоимость разработки сайта начинается от 15 000 сом для базового сайта. Landing Page - от 5000 сом, корпоративный сайт - от 15000 сом, интернет-магазин - от 30000 сом. Цена зависит от сложности и функциональности проекта.',
    category: 'Услуги',
  },
  {
    id: '7',
    question: 'Как долго разрабатывается проект?',
    answer: 'Сроки разработки зависят от сложности проекта. Базовый сайт - 1-2 недели, интернет-магазин - 3-4 недели, мобильное приложение - 4-8 недель. Срочные заказы выполняются быстрее, но с доплатой.',
    category: 'Услуги',
  },
  {
    id: '8',
    question: 'Можно ли заказать дипломную работу?',
    answer: 'Да, мы выполняем дипломные работы по IT-специальностям. В стоимость входит: полная дипломная работа на Word, 50 вопросов и ответов, объяснение как сдавать. Цена от 2000 сом в зависимости от сложности.',
    category: 'Услуги',
  },
  {
    id: '9',
    question: 'Какие технологии вы используете?',
    answer: 'Мы работаем с современными технологиями: React, Next.js, TypeScript, Node.js, Python, Firebase, React Native, Flutter и многими другими. Технологии выбираются в зависимости от требований проекта.',
    category: 'Технологии',
  },
  {
    id: '10',
    question: 'Как происходит оплата?',
    answer: 'Оплата может производиться поэтапно: 30% предоплата при начале работы, 40% при сдаче основной части, 30% после финальной сдачи. Принимаем наличные, переводы на карту.',
    category: 'Оплата',
  },
  {
    id: '11',
    question: 'Как связаться с вами?',
    answer: 'Вы можете связаться с нами через форму на странице /contacts, написать в Telegram (@Murka_ahh - Сыймыкбек, @Badboy05y - Абдыкадыр), отправить email или посетить наш Instagram: @radev.digital',
    category: 'Контакты',
  },
  {
    id: '12',
    question: 'Можно ли скрыть свой профиль от других пользователей?',
    answer: 'Да, в настройках приватности вы можете скрыть свой профиль, достижения и список подписчиков/подписок от других пользователей. Настройки находятся в разделе "Настройки" вашего профиля.',
    category: 'Приватность',
  },
]

const categories = ['Все', 'О платформе', 'Курсы', 'Социальная сеть', 'Услуги', 'Технологии', 'Оплата', 'Контакты', 'Приватность']

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все')

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems)
    if (newOpen.has(id)) {
      newOpen.delete(id)
    } else {
      newOpen.add(id)
    }
    setOpenItems(newOpen)
  }

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8 sm:py-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 glow-blue">
            Часто задаваемые вопросы
          </h1>
          <p className="text-muted-foreground">
            Найдите ответы на популярные вопросы о платформе R&A-Dev
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Вопросы не найдены</p>
                <p className="text-sm mt-2">Попробуйте изменить поисковый запрос или категорию</p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((item, index) => {
              const isOpen = openItems.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg pr-4">{item.question}</CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {item.category}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-primary" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {isOpen && (
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
