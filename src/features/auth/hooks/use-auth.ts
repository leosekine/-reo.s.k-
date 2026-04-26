'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { Profile } from '@/shared/types/database'
import type { AuthContext } from '../types'
import { findMockUser } from '../mock-data'

const AUTH_STORAGE_KEY = 'attendance_auth_user'

const authContext = createContext<AuthContext | null>(null)

export const AuthProvider = authContext.Provider

export function useAuthProvider(): AuthContext {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const profile = findMockUser(email, password)
    if (!profile) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile))
    setUser(profile)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }, [])

  return { user, loading, login, logout }
}

export function useAuth(): AuthContext {
  const ctx = useContext(authContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
