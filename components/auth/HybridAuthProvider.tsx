'use client'

import React, { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'

/**
 * Гибридный провайдер аутентификации
 * ВСЕГДА использует Firebase для аутентификации
 * C# бэкенд используется для всех остальных функций (чаты, профили, файлы и т.д.)
 */
export function HybridAuthProvider({ children }: { children: ReactNode }) {
  // Всегда используем Firebase для аутентификации
  console.log('[Auth] Using Firebase for authentication, C# API for other features')
  
  return <AuthProvider>{children}</AuthProvider>
}

