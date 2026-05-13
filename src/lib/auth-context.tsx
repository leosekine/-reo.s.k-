'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

type SignUpResult = { error: string | null; needsEmailConfirm: boolean }
export type UserRole = 'admin' | 'member'

interface AuthState {
  readonly user: User | null
  readonly role: UserRole | null
  readonly loading: boolean
  readonly signUp: (email: string, password: string, name: string) => Promise<SignUpResult>
  readonly signIn: (email: string, password: string) => Promise<string | null>
  readonly signOut: () => Promise<void>
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('user already registered') || m.includes('already registered')) return 'このメールアドレスは既に登録されています'
  if (m.includes('invalid login credentials')) return 'メールアドレスまたはパスワードが違います'
  if (m.includes('email not confirmed')) return 'メールアドレスの確認が完了していません。メールをご確認ください'
  if (m.includes('password should be at least')) return 'パスワードは6文字以上で入力してください'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'メールアドレスの形式が正しくありません'
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) return '新規登録が無効化されています。Supabaseの設定をご確認ください'
  if (m.includes('rate limit') || m.includes('too many')) return 'リクエストが多すぎます。しばらく待ってから再度お試しください'
  return message
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
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

  // user 取得後に profiles から role を取得
  useEffect(() => {
    if (!user) { setRole(null); return }
    supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
      setRole((data?.role as UserRole) ?? 'member')
    })
  }, [user])

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return { error: translateAuthError(error.message), needsEmailConfirm: false }

    // セッションが返ってきていればすぐログイン状態
    if (data.session) return { error: null, needsEmailConfirm: false }

    // セッションなし = メール確認必須設定の可能性。一応パスワードログインを試す
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      const msg = signInError.message.toLowerCase()
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        return { error: null, needsEmailConfirm: true }
      }
      return { error: translateAuthError(signInError.message), needsEmailConfirm: false }
    }
    return { error: null, needsEmailConfirm: false }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return translateAuthError(error.message)
    return null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
