'use client'

import { useState, useEffect } from 'react'

type WorkStatus = 'not_started' | 'working' | 'finished'

const STATUS_CONFIG = {
  not_started: { label: '未出勤', color: 'bg-gray-100 text-gray-600' },
  working: { label: '勤務中', color: 'bg-green-100 text-green-700' },
  finished: { label: '退勤済', color: 'bg-blue-100 text-blue-700' },
} as const

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClockIn = () => {
    setClockInTime(new Date().toISOString())
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
  }

  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col items-center pt-12">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">打刻画面</h2>

      {/* 現在時刻 */}
      <p className="mb-2 text-sm text-gray-500">現在時刻</p>
      <p className="mb-8 text-6xl font-bold tabular-nums tracking-tight text-gray-900">
        {formatTime(now)}
      </p>

      {/* 勤務状態 */}
      <span className={`mb-10 rounded-full px-5 py-2 text-sm font-semibold ${config.color}`}>
        {config.label}
      </span>

      {/* ボタン */}
      <div className="mb-10 flex gap-6">
        <button
          onClick={handleClockIn}
          disabled={status !== 'not_started'}
          className="rounded-2xl bg-green-500 px-10 py-4 text-lg font-bold text-white shadow transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          出勤
        </button>
        <button
          onClick={handleClockOut}
          disabled={status !== 'working'}
          className="rounded-2xl bg-red-500 px-10 py-4 text-lg font-bold text-white shadow transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          退勤
        </button>
      </div>

      {/* リセットボタン */}
      {status === 'finished' && (
        <button
          onClick={handleReset}
          className="mb-10 text-sm text-gray-500 underline hover:text-gray-700"
        >
          リセット
        </button>
      )}

      {/* 打刻記録 */}
      {(clockInTime || clockOutTime) && (
        <div className="w-72 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-500">本日の記録</h3>
          <div className="space-y-2 text-sm">
            {clockInTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">出勤</span>
                <span className="font-medium text-gray-900">{formatRecordTime(clockInTime)}</span>
              </div>
            )}
            {clockOutTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">退勤</span>
                <span className="font-medium text-gray-900">{formatRecordTime(clockOutTime)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
