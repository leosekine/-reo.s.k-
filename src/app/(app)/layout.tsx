'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AttendanceStoreProvider } from '@/shared/stores/attendance-store'
import { useAuth } from '@/lib/auth-context'

type Page = 'punch' | 'shifts' | 'calendar' | 'report' | 'dashboard'

const MENU_ITEMS: readonly {
  readonly id: Page
  readonly path: string
  readonly label: string
  readonly description: string
}[] = [
  { id: 'punch', path: '/punch', label: '打刻', description: '出退勤の記録' },
  { id: 'shifts', path: '/shifts', label: 'シフト', description: 'シフト希望の提出' },
  { id: 'calendar', path: '/calendar', label: 'カレンダー', description: '月間勤務一覧' },
  { id: 'report', path: '/report', label: '日報', description: '業務内容の記録' },
  { id: 'dashboard', path: '/dashboard', label: '管理', description: 'チーム全体の管理' },
]

function MenuIcon({ id }: { readonly id: Page }) {
  const props = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'punch':
      return <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    case 'shifts':
      return <svg {...props} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>
    case 'calendar':
      return <svg {...props} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    case 'report':
      return <svg {...props} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
    case 'dashboard':
      return <svg {...props} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
  }
}

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const currentMenuItem = MENU_ITEMS.find(m => pathname.startsWith(m.path))

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || ''

  // 認証ガード
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    )
  }
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* PC サイドバー (md以上) */}
      <aside className={`hidden md:flex shrink-0 flex-col bg-[#1e293b] transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-60'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-white">勤怠管理</h1>
              <p className="text-[10px] text-sky-300/60">Attendance Manager</p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {MENU_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link key={item.id} href={item.path} title={sidebarCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all ${isActive ? 'bg-sky-500/15 text-sky-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-400" />}
                <span className={`shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  <MenuIcon id={item.id} />
                </span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 px-2 py-2">
          <button onClick={() => setSidebarCollapsed(prev => !prev)} className="flex w-full items-center justify-center rounded-lg py-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
        </div>
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-sm font-bold text-white">
              {userName.charAt(0) || '?'}
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#1e293b] bg-emerald-400" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-200">{userName}</p>
                <button onClick={handleSignOut} className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">{currentMenuItem?.label}</h2>
            <p className="hidden sm:block text-[11px] text-gray-400">{currentMenuItem?.description}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">オンライン</span>
            </div>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
          <AttendanceStoreProvider>
            {children}
          </AttendanceStoreProvider>
        </main>
      </div>

      {/* モバイル ボトムナビ (md未満) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-gray-200 bg-white px-1 py-1.5 safe-area-pb">
        {MENU_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.path)
          return (
            <Link key={item.id} href={item.path}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-sky-600' : 'text-gray-400'
              }`}>
              <MenuIcon id={item.id} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
