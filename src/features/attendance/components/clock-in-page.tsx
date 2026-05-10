'use client'

import { useAttendanceStore } from '@/shared/stores/attendance-store'
import { CurrentClock } from './current-clock'
import { StatusBadge } from './status-badge'
import { PunchButtons } from './punch-buttons'
import { TodaySummary } from './today-summary'
import { WorkHistory } from './work-history'
import type { HistoryRecord } from '../types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

function toHistoryRecord(entry: { date: string; type: string; clockIn: string; clockOut: string; breakMin: number; workHours: number }): HistoryRecord {
  const d = new Date(entry.date + 'T00:00:00')
  const dayOfWeek = WEEKDAYS[d.getDay()]
  const hours = Math.floor(entry.workHours)
  const mins = Math.round((entry.workHours - hours) * 60)
  return {
    date: entry.date,
    dayOfWeek,
    clockIn: entry.clockIn,
    clockOut: entry.clockOut,
    breakMin: entry.breakMin,
    workHours: `${hours}:${String(mins).padStart(2, '0')}`,
    status: entry.type === 'late' ? 'late'
      : entry.type === 'early_leave' ? 'early_leave'
      : 'normal',
  }
}

export function ClockInPage() {
  const { entries, todayClockIn, todayClockOut, todayStatus, clockIn, clockOut, reset } = useAttendanceStore()

  // 直近7件の履歴（今日を除く）
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const history: readonly HistoryRecord[] = entries
    .filter(e => e.date !== todayStr && e.workHours > 0)
    .slice(0, 7)
    .map(toHistoryRecord)

  // 今月の集計
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const monthEntries = entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const monthWorkDays = monthEntries.filter(e => e.workHours > 0).length
  const monthTotalHours = monthEntries.reduce((sum, e) => sum + e.workHours, 0)
  const monthLateCount = monthEntries.filter(e => e.type === 'late').length

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="grid grid-cols-3 gap-6">
        {/* 左: メイン打刻エリア (2カラム) */}
        <div className="col-span-2 space-y-6">
          {/* 打刻カード */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <CurrentClock />
              <StatusBadge status={todayStatus} />
            </div>
            <div className="flex items-center justify-center px-8 py-10">
              <PunchButtons
                status={todayStatus}
                onClockIn={clockIn}
                onClockOut={clockOut}
                onReset={reset}
              />
            </div>
            <TodaySummary clockInTime={todayClockIn} clockOutTime={todayClockOut} />
          </div>

          {/* 直近の勤務履歴 */}
          <WorkHistory records={history} />
        </div>

        {/* 右: 今月サマリー */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">今月のサマリー</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">出勤日数</span>
                <span className="text-[15px] font-bold text-gray-900">{monthWorkDays} / 20日</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(monthWorkDays / 20) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">総勤務時間</span>
                <span className="text-[15px] font-bold text-gray-900">{monthTotalHours.toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">遅刻回数</span>
                <span className="text-[15px] font-bold text-red-500">{monthLateCount}回</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">有給残日数</span>
                <span className="text-[15px] font-bold text-gray-900">12日</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
