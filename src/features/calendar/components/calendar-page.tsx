'use client'

import { useState, useMemo } from 'react'

type AttendanceType = 'normal' | 'late' | 'early_leave' | 'absent' | 'holiday' | 'paid_leave'

interface AttendanceDay {
  readonly date: string
  readonly type: AttendanceType
  readonly clockIn: string
  readonly clockOut: string
  readonly breakMin: number
  readonly workHours: number
  readonly note: string
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const

const TYPE_CONFIG = {
  normal: { label: '正常', color: 'bg-blue-500', dotColor: 'bg-blue-400', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  late: { label: '遅刻', color: 'bg-red-500', dotColor: 'bg-red-400', textColor: 'text-red-700', bgColor: 'bg-red-50' },
  early_leave: { label: '早退', color: 'bg-orange-500', dotColor: 'bg-orange-400', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
  absent: { label: '欠勤', color: 'bg-gray-500', dotColor: 'bg-gray-400', textColor: 'text-gray-700', bgColor: 'bg-gray-100' },
  holiday: { label: '休日', color: 'bg-gray-300', dotColor: 'bg-gray-300', textColor: 'text-gray-500', bgColor: 'bg-gray-50' },
  paid_leave: { label: '有給', color: 'bg-emerald-500', dotColor: 'bg-emerald-400', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
} as const

function generateMockData(year: number, month: number): readonly AttendanceDay[] {
  const result: AttendanceDay[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dayOfWeek = date.getDay()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    if (date > today) continue

    const rand = Math.random()

    if (rand < 0.05) {
      result.push({ date: dateStr, type: 'paid_leave', clockIn: '-', clockOut: '-', breakMin: 0, workHours: 0, note: '有給休暇' })
    } else if (rand < 0.08) {
      result.push({ date: dateStr, type: 'absent', clockIn: '-', clockOut: '-', breakMin: 0, workHours: 0, note: '欠勤' })
    } else if (rand < 0.18) {
      const clockIn = `09:${String(Math.floor(Math.random() * 20) + 6).padStart(2, '0')}`
      const hours = 7.5 + Math.round(Math.random() * 10) / 10
      result.push({ date: dateStr, type: 'late', clockIn, clockOut: '18:15', breakMin: 60, workHours: hours, note: '遅刻' })
    } else if (rand < 0.25) {
      const hours = 6.5 + Math.round(Math.random() * 10) / 10
      result.push({ date: dateStr, type: 'early_leave', clockIn: '08:55', clockOut: '17:00', breakMin: 60, workHours: hours, note: '早退' })
    } else {
      const minutes = Math.floor(Math.random() * 15)
      const clockIn = `08:${String(45 + minutes).padStart(2, '0')}`
      const outMinutes = Math.floor(Math.random() * 30)
      const clockOut = `18:${String(outMinutes).padStart(2, '0')}`
      const hours = 8 + Math.round(Math.random() * 10) / 10
      result.push({ date: dateStr, type: 'normal', clockIn, clockOut, breakMin: 60, workHours: hours, note: '' })
    }
  }
  return result
}

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

  const data = useMemo(() => generateMockData(year, month), [year, month])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const totalDays = data.filter(d => d.type !== 'absent' && d.type !== 'holiday').length
  const totalHours = data.reduce((sum, d) => sum + d.workHours, 0)
  const lateCount = data.filter(d => d.type === 'late').length
  const paidLeaveCount = data.filter(d => d.type === 'paid_leave').length

  const findRecord = (day: number): AttendanceDay | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return data.find(d => d.date === dateStr)
  }

  const selectedRecord = selectedDay ? findRecord(selectedDay) : null

  const goToPrevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1)
      setMonth(11)
    } else {
      setMonth(m => m - 1)
    }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1)
      setMonth(0)
    } else {
      setMonth(m => m + 1)
    }
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
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* 統計カード */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400">出勤日数</p>
              <p className="text-xl font-bold text-gray-900">{totalDays}<span className="ml-0.5 text-sm font-normal text-gray-400">日</span></p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400">総勤務時間</p>
              <p className="text-xl font-bold text-gray-900">{totalHours.toFixed(1)}<span className="ml-0.5 text-sm font-normal text-gray-400">h</span></p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400">遅刻回数</p>
              <p className="text-xl font-bold text-red-600">{lateCount}<span className="ml-0.5 text-sm font-normal text-gray-400">回</span></p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400">有給取得</p>
              <p className="text-xl font-bold text-emerald-600">{paidLeaveCount}<span className="ml-0.5 text-sm font-normal text-gray-400">日</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* カレンダー (2カラム) */}
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* ヘッダー */}
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
            <button
              onClick={goToToday}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              今日
            </button>
          </div>

          <div className="p-5">
            {/* 曜日ヘッダー */}
            <div className="mb-2 grid grid-cols-7 text-center">
              {WEEKDAYS.map((w, i) => (
                <div key={w} className={`py-2 text-[11px] font-semibold ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {w}
                </div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="h-14" />

                const record = findRecord(day)
                const today = isToday(year, month, day)
                const isSelected = selectedDay === day
                const dayOfWeek = new Date(year, month, day).getDay()
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`relative flex h-14 flex-col items-center justify-center rounded-xl text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : today
                        ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500'
                        : isWeekend
                        ? 'text-gray-300'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[13px] ${isSelected ? 'font-bold' : 'font-medium'}`}>{day}</span>
                    {record && !isSelected && (
                      <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${TYPE_CONFIG[record.type].dotColor}`} />
                    )}
                    {record && isSelected && (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* 凡例 */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
              {Object.entries(TYPE_CONFIG).filter(([key]) => key !== 'holiday').map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                  <span className="text-[11px] text-gray-500">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右: 選択日の詳細 */}
        <div className="space-y-6">
          {/* 選択日の詳細 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedDay
                  ? `${month + 1}月${selectedDay}日の記録`
                  : '日付を選択してください'
                }
              </h3>
            </div>
            <div className="p-5">
              {selectedDay && selectedRecord ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${TYPE_CONFIG[selectedRecord.type].bgColor} ${TYPE_CONFIG[selectedRecord.type].textColor}`}>
                      {TYPE_CONFIG[selectedRecord.type].label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500">出勤時刻</span>
                      <span className="font-mono text-[13px] font-semibold text-gray-900">{selectedRecord.clockIn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500">退勤時刻</span>
                      <span className="font-mono text-[13px] font-semibold text-gray-900">{selectedRecord.clockOut}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-500">休憩時間</span>
                      <span className="text-[13px] font-semibold text-gray-900">{selectedRecord.breakMin}分</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-[13px] font-medium text-gray-700">実働時間</span>
                      <span className="text-[15px] font-bold text-blue-600">{selectedRecord.workHours.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              ) : selectedDay ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-400">出勤記録なし</p>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[13px] text-gray-400">カレンダーの日付をクリックすると<br />詳細が表示されます</p>
                </div>
              )}
            </div>
          </div>

          {/* 月間レポート */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">月間サマリー</h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">出勤率</span>
                    <span className="font-semibold text-gray-900">
                      {totalDays > 0 ? Math.round((data.filter(d => d.type === 'normal').length / totalDays) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${totalDays > 0 ? (data.filter(d => d.type === 'normal').length / totalDays) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">平均勤務時間</span>
                    <span className="font-semibold text-gray-900">
                      {totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0.0'}h/日
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${totalDays > 0 ? Math.min(((totalHours / totalDays) / 10) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
