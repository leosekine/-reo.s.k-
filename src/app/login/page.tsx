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
  const [showPassword, setShowPassword] = useState(false)
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
      if (password.length < 6) { setError('パスワードは6文字以上で入力してください'); setSubmitting(false); return }
      const result = await signUp(email, password, name.trim())
      if (result.error) { setError(result.error); setSubmitting(false); return }
      if (result.needsEmailConfirm) {
        setSuccess('登録メールを送信しました。メール内のリンクをクリックして認証を完了してください。')
        setMode('login')
        setSubmitting(false)
        return
      }
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* 左: ブランドビジュアル (lg以上のみ表示) */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-12 text-white">
        {/* 背景の装飾 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 rounded-full bg-cyan-400/5 blur-2xl" />
          {/* グリッド */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* ロゴ */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight">勤怠管理</p>
            <p className="text-[10px] text-sky-200/60 tracking-wider">ATTENDANCE MANAGER</p>
          </div>
        </div>

        {/* メインコピー */}
        <div className="relative z-10 max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">小規模チーム向け勤怠SaaS</span>
          </div>
          <h2 className="mb-5 text-4xl font-bold leading-[1.15] tracking-tight">
            打刻・シフト・日報を<br />
            <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent">
              ひとつの場所で。
            </span>
          </h2>
          <p className="mb-10 text-[15px] leading-relaxed text-slate-300">
            紙やスプレッドシートでの勤怠管理をやめて、ワンタップで打刻・申請・確認。
            管理者の確認作業を最大80%削減します。
          </p>

          {/* 機能リスト */}
          <ul className="space-y-3.5">
            {[
              { label: 'ワンタップ打刻', desc: '出退勤・休憩を即記録' },
              { label: 'シフト申請ワークフロー', desc: '申請→承認をオンライン化' },
              { label: '日報・カレンダー連携', desc: '勤務状況を一覧で把握' },
            ].map(item => (
              <li key={item.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">{item.label}</p>
                  <p className="text-[12px] text-slate-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* フッター */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500">
          <span>© 2026 Attendance Manager</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">利用規約</span>
            <span className="hover:text-slate-300 cursor-pointer">プライバシー</span>
          </div>
        </div>
      </div>

      {/* 右: フォーム */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[400px]">
          {/* モバイル用ロゴ */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-base font-bold text-slate-900">勤怠管理</p>
          </div>

          {/* 見出し */}
          <div className="mb-7">
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
              {mode === 'login' ? 'おかえりなさい' : 'はじめまして'}
            </h1>
            <p className="mt-1.5 text-[13px] text-slate-500">
              {mode === 'login' ? 'メールアドレスでログインしてください' : 'アカウントを作成して打刻を始めましょう'}
            </p>
          </div>

          {/* タブ切替 */}
          <div className="mb-6 inline-flex w-full rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
              className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              新規登録
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[12px] font-medium text-slate-700">名前</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="山田 太郎"
                    autoComplete="name"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pl-9 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-slate-700">メールアドレス</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pl-9 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-[12px] font-medium text-slate-700">パスワード</label>
                {mode === 'login' && (
                  <button type="button" className="text-[11px] font-medium text-sky-600 hover:text-sky-700">
                    お忘れですか？
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pl-9 pr-10 text-[14px] text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-[12px] text-emerald-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-md shadow-sky-500/20 transition-all hover:from-sky-700 hover:to-blue-700 hover:shadow-lg hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>処理中…</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'ログイン' : 'アカウント作成'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* フッター */}
          <p className="mt-8 text-center text-[12px] text-slate-500">
            {mode === 'login' ? (
              <>
                アカウントをお持ちでないですか？{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} className="font-semibold text-sky-600 hover:text-sky-700">
                  新規登録
                </button>
              </>
            ) : (
              <>
                すでにアカウントをお持ちですか？{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="font-semibold text-sky-600 hover:text-sky-700">
                  ログイン
                </button>
              </>
            )}
          </p>

          {mode === 'signup' && (
            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
              登録することで、<span className="underline cursor-pointer hover:text-slate-600">利用規約</span>と
              <span className="underline cursor-pointer hover:text-slate-600">プライバシーポリシー</span>に同意したものとみなします。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
