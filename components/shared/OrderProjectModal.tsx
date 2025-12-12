'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Briefcase, Globe, Smartphone, FileText } from 'lucide-react'
import Link from 'next/link'

export default function OrderProjectModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="group">
          <Briefcase className="mr-2 h-5 w-5" />
          Заказать проект у разработчиков
          <Briefcase className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Заказать проект у разработчиков</DialogTitle>
          <DialogDescription>
            Выберите тип проекта, который вам нужен
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Дипломные работы */}
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <CardTitle className="text-xl glow-purple">Дипломные работы</CardTitle>
                  <CardDescription>Профессиональные дипломные работы по IT-специальностям</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2">Сыймыкбек (Fullstack)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Веб-приложения на React, Next.js</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Backend на Node.js, Python</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Базы данных и API</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Абдыкадыр (Mobile)</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Мобильные приложения React Native, Flutter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Desktop приложения Electron</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Кроссплатформенная разработка</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-sm font-semibold mb-1">Цена: от 2000 сом</p>
                <p className="text-xs text-muted-foreground">Срок выполнения: от 1 недели</p>
              </div>
            </CardContent>
          </Card>

          {/* Сайты */}
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-green-500" />
                <div>
                  <CardTitle className="text-xl glow-green">Сайты</CardTitle>
                  <CardDescription>Современные веб-приложения на React, Next.js и других технологиях</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Landing Page</h4>
                  <p className="text-xs text-muted-foreground mb-2">Одностраничный сайт</p>
                  <p className="text-sm font-bold text-primary">от 5000 сом</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Корпоративный сайт</h4>
                  <p className="text-xs text-muted-foreground mb-2">Многостраничный сайт</p>
                  <p className="text-sm font-bold text-primary">от 15000 сом</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Интернет-магазин</h4>
                  <p className="text-xs text-muted-foreground mb-2">E-commerce платформа</p>
                  <p className="text-sm font-bold text-primary">от 30000 сом</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Адаптивный дизайн для всех устройств</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>SEO оптимизация</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Интеграция с платежными системами</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Приложения */}
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-blue-500" />
                <div>
                  <CardTitle className="text-xl glow-blue">Приложения</CardTitle>
                  <CardDescription>Мобильные и десктоп приложения для всех платформ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">Мобильное приложение</h4>
                  <p className="text-xs text-muted-foreground mb-2">iOS и Android</p>
                  <p className="text-sm font-bold text-primary">от 50000 сом</p>
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">Desktop приложение</h4>
                  <p className="text-xs text-muted-foreground mb-2">Windows, macOS, Linux</p>
                  <p className="text-sm font-bold text-primary">от 30000 сом</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Кроссплатформенная разработка</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Нативная производительность</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Публикация в App Store и Google Play</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4 border-t">
            <Link href="/contacts" className="flex-1">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Связаться с нами
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

