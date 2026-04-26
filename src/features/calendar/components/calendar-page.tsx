'use client'

import { useState } from 'react'

interface AttendanceDay {
  readonly date: string
  readonly hours: number
}

const WEEKDAYS = ['日', '月', '火', '水', '���', '金', '土'] as const

function generateMockData(year: number, month: number): readonly AttendanceDay[] {
  const result: AttendanceDay[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    const today = new Date()
    if (date > today) continue

    if (Math.random() > 0.15) {
      const hours = 7 + Math.round(Math.random() * 20) / 10
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      result.push({ date: dateStr, hours })
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

function isSameDay(dateStr: string, year: number, month: number, day: number): boolean {
  const target = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return dateStr === target
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
  const [data] = useState<readonly AttendanceDay[]>(() => generateMockData(now.getFullYear(), now.getMonth()))

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const totalDays = data.length
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)

  const findRecord = (day: number): AttendanceDay | undefined =>
    data.find(d => isSameDay(d.date, year, month, day))

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

  // カレンダーのセルを生成
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pt-10">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">カレンダー画面</h2>

      {/* 集計カード */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">出勤日数</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {totalDays}<span className="ml-1 text-base font-normal text-gray-500">日</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">合計勤務時間</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {totalHours.toFixed(1)}<span className="ml-1 text-base font-normal text-gray-500">時間</span>
          </p>
        </div>
      </div>

      {/* カレンダー */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* ヘッダー：月切り替え */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            ← 前月
          </button>
          <h3 className="text-lg font-bold text-gray-900">
            {year}年{month + 1}月
          </h3>
          <button
            onClick={goToNextMonth}
            className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            翌月 →
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
          {WEEKDAYS.map(w => (
            <div key={w} className="py-2">{w}</div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />
            }

            const record = findRecord(day)
            const today = isToday(year, month, day)
            const isSelected = selectedDay === day

            let bgClass = 'hover:bg-gray-50'
            if (record) {
              bgClass = 'bg-green-50 text-green-900 hover:bg-green-100'
            }
            if (isSelected) {
              bgClass = 'bg-blue-100 text-blue-900'
            }

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`relative flex h-12 items-center justify-center rounded-lg text-sm transition-colors ${bgClass} ${
                  today ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {day}
                {record && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-green-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択日の詳細 */}
      {selectedDay && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-500">
            {year}年{month + 1}月{selectedDay}日の記録
          </h4>
          {selectedRecord ? (
            <p className="mt-2 text-lg font-bold text-gray-900">
              勤務時間: {selectedRecord.hours.toFixed(1)} 時間
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-400">出勤記録なし</p>
          )}
        </div>
      )}
    </div>
  )
}
