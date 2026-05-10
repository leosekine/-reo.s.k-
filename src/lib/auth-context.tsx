'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  readonly user: User | null
  readonly loading: boolean
  readonly signUp: (email: string, password: string, name: string) => Promise<string | null>
  readonly signIn: (email: string, password: string) => Promise<string | null>
  readonly signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return error.message
    // 登録後に自動ログイン
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return signInError.message
    return null
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    return null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
