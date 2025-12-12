'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function ServicesPage() {
  const { t } = useTranslation()

  const packages = [
    {
      name: t('services.packages.standard.title'),
      price: t('services.packages.standard.price'),
      features: t('services.packages.standard.features', { returnObjects: true }) as string[],
      variant: 'default' as const,
    },
    {
      name: t('services.packages.premium.title'),
      price: t('services.packages.premium.price'),
      features: t('services.packages.premium.features', { returnObjects: true }) as string[],
      variant: 'neon' as const,
    },
    {
      name: t('services.packages.vip.title'),
      price: t('services.packages.vip.price'),
      features: t('services.packages.vip.features', { returnObjects: true }) as string[],
      variant: 'default' as const,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 glow-blue">
          {t('services.title')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
          {t('services.subtitle')}
        </p>
      </div>

      {/* Services by Developer */}
      <div id="diplomas" className="scroll-mt-20"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl glow-purple">
              {t('services.fullstack.title')}
            </CardTitle>
            <CardDescription>Сыймыкбек</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(t('services.fullstack.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-neon-green mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl glow-green">
              {t('services.mobile.title')}
            </CardTitle>
            <CardDescription>Абдыкадыр</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(t('services.mobile.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-neon-green mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div id="websites" className="scroll-mt-20"></div>
      <div id="applications" className="scroll-mt-20"></div>
      {/* Pricing */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Наши цены</h2>
        <p className="text-muted-foreground">Прозрачное ценообразование для всех типов проектов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl">Дипломная работа</CardTitle>
            <CardDescription className="text-xl font-bold text-primary mt-2">
              от 2000 сом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Полная дипломная работа на Word</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>50 вопросов и 50 ответов по теме</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Полное объяснение как сдавать</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Цена зависит от уровня сложности</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl">Веб-сайт/Магазин</CardTitle>
            <CardDescription className="text-xl font-bold text-primary mt-2">
              от 15 000 сом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Полностью готовый сайт под ключ</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Современный дизайн</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>С доп. пожеланиями: 20 000 сом</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl">Android приложение</CardTitle>
            <CardDescription className="text-xl font-bold text-primary mt-2">
              30 000 сом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Полностью готовое приложение</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Под ключ</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Публикация в Google Play</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl">iOS приложение</CardTitle>
            <CardDescription className="text-xl font-bold text-primary mt-2">
              30 000 сом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Полностью готовое приложение</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Под ключ</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                <span>Публикация в App Store</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center p-6 bg-secondary rounded-lg max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground mb-2">
          💡 Для других типов проектов разработчики сами оценят работу
        </p>
        <p className="text-sm text-muted-foreground">
          Напишите в Telegram: <a href="https://t.me/Murka_ahh" className="text-primary hover:underline">@Murka_ahh</a> (Сыймыкбек) или <a href="https://t.me/Badboy05y" className="text-primary hover:underline">@Badboy05y</a> (Абдыкадыр)
        </p>
      </div>

      {/* Payment Terms */}
      <div className="mt-20 text-center">
        <h3 className="text-2xl font-bold mb-6">Условия оплаты</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">30%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Начало работы</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">40%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Сдача основной части</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">30%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Финальная сдача</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

