'use client'

import { useState } from 'react'
import { ClockInPage } from '@/features/attendance/components/clock-in-page'
import { ShiftRequestPage } from '@/features/shift/components/shift-request-page'
import { CalendarPage } from '@/features/calendar/components/calendar-page'
import { DailyReportPage } from '@/features/daily-report/components/daily-report-page'
import { DashboardPage } from '@/features/dashboard/components/dashboard-page'

type Page = 'attendance' | 'shift' | 'calendar' | 'report' | 'dashboard'

const MENU_ITEMS: readonly { readonly id: Page; readonly label: string }[] = [
  { id: 'attendance', label: '打刻' },
  { id: 'shift', label: 'シフト申請' },
  { id: 'calendar', label: 'カレンダー' },
  { id: 'report', label: '日報' },
  { id: 'dashboard', label: 'ダッシュボード' },
]

const PAGE_TITLES: Record<Page, string> = {
  attendance: '打刻画面',
  shift: 'シフト申請画面',
  calendar: 'カレンダー画面',
  report: '日報画面',
  dashboard: 'ダッシュボード画面',
}

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
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-gray-900">
        <div className="px-6 py-5">
          <h1 className="text-lg font-bold text-white">勤怠管理</h1>
        </div>
        <nav className="space-y-1 px-3">
          {MENU_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <PageContent page={currentPage} />
      </main>
    </div>
  )
}
