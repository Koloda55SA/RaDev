'use client'

import { useEffect } from 'react'
import '@/lib/i18n/config'

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

