'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, Calculator } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ProjectType = 'diploma' | 'website' | 'mobile' | 'desktop' | 'other'

interface PriceConfig {
  base: number
  features: { [key: string]: number }
  complexity: { [key: string]: number }
}

const priceConfigs: { [key in ProjectType]: PriceConfig } = {
  diploma: {
    base: 2000,
    features: {
      'basic': 0,
      'advanced': 1000,
      'expert': 2000,
    },
    complexity: {
      'simple': 0,
      'medium': 500,
      'complex': 1500,
    },
  },
  website: {
    base: 15000,
    features: {
      'basic': 0,
      'cms': 5000,
      'ecommerce': 10000,
      'custom': 15000,
    },
    complexity: {
      'simple': 0,
      'medium': 5000,
      'complex': 15000,
    },
  },
  mobile: {
    base: 30000,
    features: {
      'basic': 0,
      'api': 5000,
      'payment': 10000,
      'full': 20000,
    },
    complexity: {
      'simple': 0,
      'medium': 10000,
      'complex': 25000,
    },
  },
  desktop: {
    base: 30000,
    features: {
      'basic': 0,
      'advanced': 10000,
      'enterprise': 20000,
    },
    complexity: {
      'simple': 0,
      'medium': 10000,
      'complex': 25000,
    },
  },
  other: {
    base: 0,
    features: {},
    complexity: {},
  },
}

export default function CalculatorPage() {
  const router = useRouter()
  const [projectType, setProjectType] = useState<ProjectType>('website')
  const [feature, setFeature] = useState<string>('basic')
  const [complexity, setComplexity] = useState<string>('simple')
  const [urgency, setUrgency] = useState<string>('normal')

  const calculatePrice = () => {
    const config = priceConfigs[projectType]
    let price = config.base
    
    if (config.features[feature]) {
      price += config.features[feature]
    }
    
    if (config.complexity[complexity]) {
      price += config.complexity[complexity]
    }
    
    // Срочность
    if (urgency === 'urgent') {
      price = Math.round(price * 1.5)
    } else if (urgency === 'very-urgent') {
      price = Math.round(price * 2)
    }
    
    return price
  }

  const finalPrice = calculatePrice()

  const handleOrder = () => {
    const params = new URLSearchParams({
      type: projectType,
      feature,
      complexity,
      urgency,
      estimatedPrice: finalPrice.toString(),
    })
    router.push(`/contacts?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-blue flex items-center justify-center gap-3">
          <Calculator className="h-10 w-10" />
          Калькулятор стоимости
        </h1>
        <p className="text-lg text-muted-foreground">
          Рассчитайте стоимость вашего проекта за несколько кликов
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Выберите параметры проекта</CardTitle>
              <CardDescription>Укажите тип проекта и его характеристики</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="type">Тип проекта *</Label>
                <Select value={projectType} onValueChange={(value) => setProjectType(value as ProjectType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diploma">Дипломная работа</SelectItem>
                    <SelectItem value="website">Веб-сайт</SelectItem>
                    <SelectItem value="mobile">Мобильное приложение</SelectItem>
                    <SelectItem value="desktop">Десктоп приложение</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {projectType !== 'other' && (
                <>
                  <div>
                    <Label htmlFor="feature">Функциональность</Label>
                    <Select value={feature} onValueChange={setFeature}>
                      <SelectTrigger id="feature">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projectType === 'diploma' && (
                          <>
                            <SelectItem value="basic">Базовая (2000 сом)</SelectItem>
                            <SelectItem value="advanced">Расширенная (+1000 сом)</SelectItem>
                            <SelectItem value="expert">Экспертная (+2000 сом)</SelectItem>
                          </>
                        )}
                        {projectType === 'website' && (
                          <>
                            <SelectItem value="basic">Базовый сайт (15000 сом)</SelectItem>
                            <SelectItem value="cms">С CMS (+5000 сом)</SelectItem>
                            <SelectItem value="ecommerce">Интернет-магазин (+10000 сом)</SelectItem>
                            <SelectItem value="custom">Кастомное решение (+15000 сом)</SelectItem>
                          </>
                        )}
                        {(projectType === 'mobile' || projectType === 'desktop') && (
                          <>
                            <SelectItem value="basic">Базовое приложение (30000 сом)</SelectItem>
                            <SelectItem value="api">С API интеграцией (+5000 сом)</SelectItem>
                            <SelectItem value="payment">С платежами (+10000 сом)</SelectItem>
                            <SelectItem value="full">Полный функционал (+20000 сом)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="complexity">Сложность проекта</Label>
                    <Select value={complexity} onValueChange={setComplexity}>
                      <SelectTrigger id="complexity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Простая</SelectItem>
                        <SelectItem value="medium">Средняя (+5000-10000 сом)</SelectItem>
                        <SelectItem value="complex">Сложная (+15000-25000 сом)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="urgency">Срочность</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Обычная (стандартные сроки)</SelectItem>
                    <SelectItem value="urgent">Срочно (+50% к стоимости)</SelectItem>
                    <SelectItem value="very-urgent">Очень срочно (+100% к стоимости)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Итоговая стоимость</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {finalPrice.toLocaleString('ru-RU')} сом
                </div>
                <p className="text-sm text-muted-foreground">
                  {projectType === 'other' ? 'Свяжитесь с нами для уточнения' : 'Примерная стоимость'}
                </p>
              </div>

              {projectType !== 'other' && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Базовая стоимость:</span>
                    <span>{priceConfigs[projectType].base.toLocaleString('ru-RU')} сом</span>
                  </div>
                  {priceConfigs[projectType].features[feature] > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Функциональность:</span>
                      <span>+{priceConfigs[projectType].features[feature].toLocaleString('ru-RU')} сом</span>
                    </div>
                  )}
                  {priceConfigs[projectType].complexity[complexity] > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Сложность:</span>
                      <span>+{priceConfigs[projectType].complexity[complexity].toLocaleString('ru-RU')} сом</span>
                    </div>
                  )}
                  {(urgency === 'urgent' || urgency === 'very-urgent') && (
                    <div className="flex justify-between text-primary">
                      <span>Срочность:</span>
                      <span>+{Math.round((finalPrice - (finalPrice / (urgency === 'urgent' ? 1.5 : 2)))).toLocaleString('ru-RU')} сом</span>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleOrder} 
                className="w-full" 
                size="lg"
                variant="neon"
              >
                Заказать проект
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                * Финальная стоимость может отличаться после обсуждения деталей проекта
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}







