'use client'

import { useState, useEffect } from 'react'

type WorkStatus = 'not_started' | 'working' | 'on_break' | 'finished'

const STATUS_CONFIG = {
  not_started: { label: '未出勤', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  working: { label: '勤務中', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  on_break: { label: '休憩中', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  finished: { label: '退勤済', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
} as const

interface HistoryRecord {
  readonly date: string
  readonly clockIn: string
  readonly clockOut: string
  readonly breakMin: number
  readonly workHours: string
  readonly status: 'normal' | 'late' | 'early_leave'
}

const MOCK_HISTORY: readonly HistoryRecord[] = [
  { date: '2026-05-09（金）', clockIn: '08:55', clockOut: '18:02', breakMin: 60, workHours: '8.1h', status: 'normal' },
  { date: '2026-05-08（木）', clockIn: '09:12', clockOut: '18:30', breakMin: 60, workHours: '8.3h', status: 'late' },
  { date: '2026-05-07（水）', clockIn: '08:50', clockOut: '17:30', breakMin: 60, workHours: '7.7h', status: 'early_leave' },
  { date: '2026-05-06（火）', clockIn: '08:58', clockOut: '18:15', breakMin: 60, workHours: '8.3h', status: 'normal' },
  { date: '2026-05-05（月）', clockIn: '09:00', clockOut: '18:00', breakMin: 60, workHours: '8.0h', status: 'normal' },
]

const STATUS_BADGE = {
  normal: { label: '正常', color: 'bg-green-100 text-green-700' },
  late: { label: '遅刻', color: 'bg-red-100 text-red-700' },
  early_leave: { label: '早退', color: 'bg-orange-100 text-orange-700' },
} as const

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDateJP(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function formatRecordTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ClockInPage() {
  const [now, setNow] = useState(() => new Date())
  const [status, setStatus] = useState<WorkStatus>('not_started')
  const [clockInTime, setClockInTime] = useState<string | null>(null)
  const [clockOutTime, setClockOutTime] = useState<string | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null)
  const [totalBreakMin, setTotalBreakMin] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClockIn = () => {
    setClockInTime(new Date().toISOString())
    setStatus('working')
  }

  const handleBreakStart = () => {
    setBreakStartTime(new Date().toISOString())
    setStatus('on_break')
  }

  const handleBreakEnd = () => {
    if (breakStartTime) {
      const breakDuration = Math.round((Date.now() - new Date(breakStartTime).getTime()) / 60000)
      setTotalBreakMin(prev => prev + breakDuration)
    }
    setBreakStartTime(null)
    setStatus('working')
  }

  const handleClockOut = () => {
    setClockOutTime(new Date().toISOString())
    setStatus('finished')
  }

  const handleReset = () => {
    setStatus('not_started')
    setClockInTime(null)
    setClockOutTime(null)
    setBreakStartTime(null)
    setTotalBreakMin(0)
  }

  const config = STATUS_CONFIG[status]

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* 打刻エリア */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center">
          {/* 日付 */}
          <p className="mb-1 text-sm text-gray-500">{formatDateJP(now)}</p>

          {/* 現在時刻 */}
          <p className="mb-6 text-7xl font-bold tabular-nums tracking-tight text-gray-900">
            {formatTime(now)}
          </p>

          {/* 勤務状態 */}
          <div className="mb-8 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${config.dot} ${status === 'working' || status === 'on_break' ? 'animate-pulse' : ''}`} />
            <span className={`rounded-full px-5 py-2 text-sm font-semibold ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* ボタン群 */}
          <div className="flex gap-4">
            <button
              onClick={handleClockIn}
              disabled={status !== 'not_started'}
              className="rounded-2xl bg-green-500 px-12 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              出勤
            </button>
            {status === 'working' && (
              <button
                onClick={handleBreakStart}
                className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-bold text-yellow-900 shadow-lg shadow-yellow-400/20 transition-all hover:bg-yellow-500"
              >
                休憩開始
              </button>
            )}
            {status === 'on_break' && (
              <button
                onClick={handleBreakEnd}
                className="rounded-2xl bg-yellow-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-yellow-500/20 transition-all hover:bg-yellow-600"
              >
                休憩終了
              </button>
            )}
            <button
              onClick={handleClockOut}
              disabled={status !== 'working'}
              className="rounded-2xl bg-red-500 px-12 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 hover:shadow-red-500/30 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            >
              退勤
            </button>
          </div>

          {/* リセット */}
          {status === 'finished' && (
            <button
              onClick={handleReset}
              className="mt-4 text-sm text-gray-400 underline hover:text-gray-600"
            >
              リセット（デモ用）
            </button>
          )}
        </div>

        {/* 本日の記録 */}
        {(clockInTime || clockOutTime) && (
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">出勤時刻</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {clockInTime ? formatRecordTime(clockInTime) : '--:--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">退勤時刻</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {clockOutTime ? formatRecordTime(clockOutTime) : '--:--'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">休憩時間</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalBreakMin}分</p>
            </div>
          </div>
        )}
      </div>

      {/* 直近の勤務履歴 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">直近の勤務履歴</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
                <th className="pb-3 pr-4">日付</th>
                <th className="pb-3 pr-4">出勤</th>
                <th className="pb-3 pr-4">退勤</th>
                <th className="pb-3 pr-4">休憩</th>
                <th className="pb-3 pr-4">実働</th>
                <th className="pb-3">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_HISTORY.map(record => {
                const badge = STATUS_BADGE[record.status]
                return (
                  <tr key={record.date} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{record.date}</td>
                    <td className="py-3 pr-4 text-gray-700">{record.clockIn}</td>
                    <td className="py-3 pr-4 text-gray-700">{record.clockOut}</td>
                    <td className="py-3 pr-4 text-gray-700">{record.breakMin}分</td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{record.workHours}</td>
                    <td className="py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
