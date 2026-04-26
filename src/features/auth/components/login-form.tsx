'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/use-auth'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { loginSchema } from '@/shared/utils/validation'
import { APP_NAME } from '@/shared/constants/config'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    setLoading(true)
    try {
      const loginResult = await login(email, password)
      if (loginResult.success) {
        router.replace('/attendance')
      } else {
        setErrors({ form: loginResult.error })
      }
    } catch {
      setErrors({ form: 'ログインに失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-gray-600">アカウントにログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={errors.email}
            placeholder="admin@example.com"
            autoComplete="email"
          />

          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            placeholder="password123"
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" loading={loading}>
            ログイン
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium mb-1">テストアカウント:</p>
          <p>管理者: admin@example.com / password123</p>
          <p>メンバー: member@example.com / password123</p>
        </div>
      </Card>
    </div>
  )
}
