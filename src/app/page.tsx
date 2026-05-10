'use client'

import { useState } from 'react'
import { ClockInPage } from '@/features/attendance/components/clock-in-page'
import { ShiftRequestPage } from '@/features/shift/components/shift-request-page'
import { CalendarPage } from '@/features/calendar/components/calendar-page'
import { DailyReportPage } from '@/features/daily-report/components/daily-report-page'
import { DashboardPage } from '@/features/dashboard/components/dashboard-page'

type Page = 'attendance' | 'shift' | 'calendar' | 'report' | 'dashboard'
type Role = 'admin' | 'member'

const MOCK_USER = { name: '山田 太郎', role: 'admin' as Role }

const MENU_ITEMS: readonly { readonly id: Page; readonly label: string; readonly icon: string }[] = [
  { id: 'attendance', label: '打刻', icon: '🕐' },
  { id: 'shift', label: 'シフト申請', icon: '📅' },
  { id: 'calendar', label: 'カレンダー', icon: '📆' },
  { id: 'report', label: '日報', icon: '📝' },
  { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
]

function PageContent({ page }: { readonly page: Page }) {
  switch (page) {
    case 'attendance':
      return <ClockInPage />
    case 'shift':
      return <ShiftRequestPage />
    case 'calendar':
      return <CalendarPage />
    case 'report':
      return <DailyReportPage />
    case 'dashboard':
      return <DashboardPage />
  }
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('attendance')

  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <aside className="flex w-64 shrink-0 flex-col bg-gray-900">
        {/* ロゴ */}
        <div className="border-b border-gray-700 px-6 py-5">
          <h1 className="text-xl font-bold text-white tracking-wide">勤怠管理</h1>
          <p className="mt-1 text-xs text-gray-400">Attendance Manager</p>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* ユーザー情報 */}
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              {MOCK_USER.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{MOCK_USER.name}</p>
              <p className="text-xs text-gray-400">
                {MOCK_USER.role === 'admin' ? '管理者' : 'メンバー'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {MENU_ITEMS.find(m => m.id === currentPage)?.label}
          </h2>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              オンライン
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <PageContent page={currentPage} />
        </main>
      </div>
    </div>
  )
}
