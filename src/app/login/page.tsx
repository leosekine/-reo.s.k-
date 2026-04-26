'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { LoginForm } from '@/features/auth/components/login-form'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/attendance')
    }
  }, [user, loading, router])

  if (loading || user) {
    return null
  }

  return <LoginForm />
}
