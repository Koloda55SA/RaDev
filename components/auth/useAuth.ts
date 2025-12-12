/**
 * Единый хук useAuth, который работает с любым провайдером
 * Автоматически определяет, какой провайдер активен
 */

'use client'

import { useContext } from 'react'
import { AuthContext as ApiAuthContext } from './ApiAuthProvider'
import { AuthContext as FirebaseAuthContext } from './AuthProvider'

export function useAuth() {
  // Вызываем оба хука безусловно (правило React Hooks)
  const apiContext = useContext(ApiAuthContext)
  const firebaseContext = useContext(FirebaseAuthContext)
  
  // Сначала пытаемся использовать ApiAuthProvider
  if (apiContext !== undefined && apiContext !== null) {
    return apiContext
  }

  // Затем пытаемся использовать Firebase AuthProvider
  if (firebaseContext !== undefined && firebaseContext !== null) {
    return firebaseContext
  }

  throw new Error('useAuth must be used within an AuthProvider or ApiAuthProvider')
}

