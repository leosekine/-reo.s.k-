'use client'

import { useState, useMemo } from 'react'
import { useAttendanceStore, type AttendanceEntry } from '@/shared/stores/attendance-store'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

const TYPE_CONFIG = {
  normal: { label: '出勤', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  late: { label: '遅刻', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  early_leave: { label: '早退', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  paid_leave: { label: '有給', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
} as const

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
}

export function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const { entries } = useAttendanceStore()

  // 表示中の月のデータを抽出
  const monthData = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
    return entries.filter(e => e.date.startsWith(prefix))
  }, [entries, year, month])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  // 集計
  const workDays = monthData.filter(d => d.workHours > 0)
  const totalAttendanceDays = workDays.length
  const totalWorkHours = workDays.reduce((sum, d) => sum + d.workHours, 0)
  const lateCount = monthData.filter(d => d.type === 'late').length
  const paidLeaveCount = monthData.filter(d => d.type === 'paid_leave').length
  const avgWorkHours = totalAttendanceDays > 0 ? totalWorkHours / totalAttendanceDays : 0

  const findRecord = (day: number): AttendanceEntry | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return monthData.find(d => d.date === dateStr)
  }

  const selectedRecord = selectedDay ? findRecord(selectedDay) : null

  const goToPrevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else { setMonth(m => m - 1) }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else { setMonth(m => m + 1) }
    setSelectedDay(null)
  }

  const goToToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
    setSelectedDay(now.getDate())
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      {/* 月間集計バー */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-gray-100 sm:grid-cols-4">
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium text-gray-400">出勤日数</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{totalAttendanceDays}</span>
              <span className="text-sm text-gray-400">日</span>
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium text-gray-400">合計勤務時間</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{totalWorkHours.toFixed(1)}</span>
              <span className="text-sm text-gray-400">時間</span>
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium text-gray-400">平均勤務時間</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{avgWorkHours.toFixed(1)}</span>
              <span className="text-sm text-gray-400">h/日</span>
            </p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium text-gray-400">遅刻 / 有給</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-500">{lateCount}</span>
              <span className="text-sm text-gray-300">/</span>
              <span className="text-2xl font-bold text-blue-500">{paidLeaveCount}</span>
              <span className="text-sm text-gray-400">回</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* カレンダー */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={goToPrevMonth} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h3 className="min-w-[120px] text-center text-[15px] font-bold text-gray-900">
                {year}年{month + 1}月
              </h3>
              <button onClick={goToNextMonth} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <button onClick={goToToday} className="rounded-lg bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-200">
              今日
            </button>
          </div>

          <div className="p-4">
            {/* 曜日ヘッダー */}
            <div className="mb-1 grid grid-cols-7 text-center">
              {WEEKDAYS.map((w, i) => (
                <div key={w} className={`py-2 text-[11px] font-semibold ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}>{w}</div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="h-[60px] sm:h-[72px]" />

                const record = findRecord(day)
                const today = isToday(year, month, day)
                const isSelected = selectedDay === day
                const dayOfWeek = new Date(year, month, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`relative flex h-[60px] flex-col items-center rounded-lg px-0.5 pt-1 text-sm transition-all sm:h-[72px] sm:px-1 sm:pt-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : today
                        ? 'bg-blue-50 ring-2 ring-blue-400'
                        : isWeekend
                        ? 'bg-gray-50/50 text-gray-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[12px] ${
                      isSelected ? 'font-bold text-white'
                        : today ? 'font-bold text-blue-700'
                        : isWeekend ? 'text-gray-300'
                        : 'font-medium text-gray-700'
                    }`}>{day}</span>

                    {record && (
                      <div className="mt-1 flex flex-col items-center gap-0.5">
                        {record.type === 'normal' ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke={isSelected ? 'white' : '#10b981'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className={`rounded px-1 text-[9px] font-bold ${
                            isSelected ? 'bg-white/20 text-white' : `${TYPE_CONFIG[record.type].bg} ${TYPE_CONFIG[record.type].text}`
                          }`}>
                            {TYPE_CONFIG[record.type].label}
                          </span>
                        )}
                        {record.workHours > 0 && (
                          <span className={`text-[9px] font-medium ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                            {record.workHours.toFixed(1)}h
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 凡例 */}
            <div className="mt-3 flex items-center gap-5 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[11px] text-gray-500">出勤</span>
              </div>
              {Object.entries(TYPE_CONFIG).filter(([k]) => k !== 'normal').map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`rounded px-1 text-[9px] font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右サイドバー */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedDay ? `${month + 1}月${selectedDay}日の記録` : '日付を選択'}
              </h3>
            </div>
            <div className="p-5">
              {selectedDay && selectedRecord ? (
                <div className="space-y-3">
                  <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${TYPE_CONFIG[selectedRecord.type].bg} ${TYPE_CONFIG[selectedRecord.type].text} ${TYPE_CONFIG[selectedRecord.type].border}`}>
                    {TYPE_CONFIG[selectedRecord.type].label}
                  </span>
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500">出勤</span>
                      <span className="font-mono text-[13px] font-semibold text-gray-900">{selectedRecord.clockIn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500">退勤</span>
                      <span className="font-mono text-[13px] font-semibold text-gray-900">{selectedRecord.clockOut}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500">休憩</span>
                      <span className="text-[13px] font-semibold text-gray-900">{selectedRecord.breakMin}分</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                      <span className="text-[13px] font-medium text-gray-700">実働時間</span>
                      <span className="text-[15px] font-bold text-blue-600">{selectedRecord.workHours.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              ) : selectedDay ? (
                <p className="py-4 text-center text-[13px] text-gray-400">出勤記録なし</p>
              ) : (
                <p className="py-4 text-center text-[13px] text-gray-400">カレンダーの日付をクリック</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">月間レポート</h3>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-gray-500">出勤率</span>
                  <span className="font-semibold text-gray-900">
                    {totalAttendanceDays > 0 ? Math.round((monthData.filter(d => d.type === 'normal').length / totalAttendanceDays) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${totalAttendanceDays > 0 ? (monthData.filter(d => d.type === 'normal').length / totalAttendanceDays) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-gray-500">平均勤務</span>
                  <span className="font-semibold text-gray-900">{avgWorkHours.toFixed(1)}h/日</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min((avgWorkHours / 10) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[12px]">
                <span className="text-gray-500">所定労働日数</span>
                <span className="font-semibold text-gray-900">20日</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
