'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tag, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api/client'
import { motion } from 'framer-motion'

interface PromoCode {
  id: string
  code: string
  discount: number
  type: 'percent' | 'fixed'
  minAmount?: number
  maxDiscount?: number
  validUntil?: any
  usedCount?: number
  maxUses?: number
  active: boolean
}

export default function PromoCodesPage() {
  const [code, setCode] = useState('')
  const [appliedCode, setAppliedCode] = useState<PromoCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [availableCodes, setAvailableCodes] = useState<PromoCode[]>([])

  useEffect(() => {
    const loadCodes = async () => {
      try {
        const response = await apiClient.getPromoCodes()
        if (response.success && response.data) {
          const codes = response.data
            .filter((item: any) => item.active !== false)
            .map((item: any) => ({
              id: item.id || item.codeId,
              code: item.code || '',
              discount: item.discountPercent || item.discountAmount || 0,
              type: item.discountPercent ? 'percent' : 'fixed',
              minAmount: item.minAmount,
              maxDiscount: item.maxDiscount,
              validUntil: item.validUntil ? new Date(item.validUntil) : undefined,
              usedCount: item.usesCount || 0,
              maxUses: item.usesLimit,
              active: item.active !== false,
            })) as PromoCode[]
          setAvailableCodes(codes)
        }
      } catch (error) {
        console.error('Error loading promo codes:', error)
      }
    }
    loadCodes()
    
    // Polling для обновления каждые 30 секунд
    const interval = setInterval(loadCodes, 30000)
    return () => clearInterval(interval)
  }, [])

  const applyCode = async () => {
    if (!code.trim()) {
      toast.error('Введите промокод')
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.getPromoCodes()
      if (!response.success || !response.data) {
        throw new Error('Не удалось загрузить промокоды')
      }

      const promoCodeData = response.data.find(
        (item: any) => item.code?.toUpperCase() === code.toUpperCase() && item.active !== false
      )

      if (!promoCodeData) {
        toast.error('Промокод не найден или недействителен')
        setLoading(false)
        return
      }

      const promoCode: PromoCode = {
        id: promoCodeData.id || promoCodeData.codeId,
        code: promoCodeData.code || '',
        discount: promoCodeData.discountPercent || promoCodeData.discountAmount || 0,
        type: promoCodeData.discountPercent ? 'percent' : 'fixed',
        minAmount: promoCodeData.minAmount,
        maxDiscount: promoCodeData.maxDiscount,
        validUntil: promoCodeData.validUntil ? new Date(promoCodeData.validUntil) : undefined,
        usedCount: promoCodeData.usesCount || 0,
        maxUses: promoCodeData.usesLimit,
        active: promoCodeData.active !== false,
      }

      // Проверка срока действия
      if (promoCode.validUntil && promoCode.validUntil < new Date()) {
        toast.error('Промокод истек')
        setLoading(false)
        return
      }

      // Проверка лимита использований
      if (promoCode.maxUses && (promoCode.usedCount || 0) >= promoCode.maxUses) {
        toast.error('Промокод больше недействителен (лимит использований)')
        setLoading(false)
        return
      }

      // TODO: Увеличить счетчик использований через C# API
      // Пока просто применяем промокод локально
      setAppliedCode(promoCode)
      toast.success(`Промокод применен! Скидка: ${promoCode.discount}${promoCode.type === 'percent' ? '%' : ' сом'}`)
    } catch (error: any) {
      console.error('Error applying promo code:', error)
      toast.error(`Ошибка применения промокода: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const removeCode = () => {
    setAppliedCode(null)
    setCode('')
    toast.success('Промокод удален')
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-blue flex items-center justify-center gap-3">
          <Tag className="h-10 w-10" />
          Промокоды и скидки
        </h1>
        <p className="text-lg text-muted-foreground">
          Используйте промокоды для получения скидок на наши услуги
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Применить промокод</CardTitle>
            <CardDescription>
              Введите промокод для получения скидки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appliedCode ? (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Промокод применен!</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeCode}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Скидка: <span className="font-bold text-green-500">
                    {appliedCode.discount}{appliedCode.type === 'percent' ? '%' : ' сом'}
                  </span>
                </p>
                {appliedCode.minAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Минимальная сумма заказа: {appliedCode.minAmount} сом
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="promocode">Промокод</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="promocode"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Введите промокод"
                      disabled={loading}
                    />
                    <Button onClick={applyCode} disabled={loading || !code.trim()}>
                      {loading ? '...' : 'Применить'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Доступные промокоды</CardTitle>
            <CardDescription>
              Активные промокоды на данный момент
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableCodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет доступных промокодов
              </p>
            ) : (
              <div className="space-y-3">
                {availableCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-3 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-primary">{promo.code}</span>
                      <span className="text-sm font-semibold text-green-500">
                        -{promo.discount}{promo.type === 'percent' ? '%' : ' сом'}
                      </span>
                    </div>
                    {promo.minAmount && (
                      <p className="text-xs text-muted-foreground">
                        Минимум: {promo.minAmount} сом
                      </p>
                    )}
                    {promo.validUntil && (
                      <p className="text-xs text-muted-foreground">
                        Действует до: {promo.validUntil.toDate().toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




