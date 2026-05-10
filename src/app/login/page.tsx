'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp, loading, user } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    router.replace('/punch')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    if (mode === 'signup') {
      if (!name.trim()) { setError('名前を入力してください'); setSubmitting(false); return }
      const err = await signUp(email, password, name.trim())
      if (err) { setError(err); setSubmitting(false); return }
      router.replace('/punch')
    } else {
      const err = await signIn(email, password)
      if (err) { setError(err); setSubmitting(false); return }
      router.replace('/punch')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">勤怠管理</h1>
          <p className="mt-1 text-sm text-gray-400">Attendance Manager</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              ログイン
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-gray-600">名前</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="山田 太郎"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">メールアドレス</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">パスワード</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6文字以上" required minLength={6}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>

            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</div>}
            {success && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">{success}</div>}

            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300">
              {submitting ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
