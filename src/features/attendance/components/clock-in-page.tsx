'use client'

import { useState, useEffect } from 'react'

type WorkStatus = 'not_started' | 'working' | 'on_break' | 'finished'

interface ClockRecord {
  readonly type: 'clock_in' | 'break_start' | 'break_end' | 'clock_out'
  readonly time: string
  readonly label: string
}

interface HistoryRecord {
  readonly date: string
  readonly dayOfWeek: string
  readonly clockIn: string
  readonly clockOut: string
  readonly breakMin: number
  readonly workHours: string
  readonly status: 'normal' | 'late' | 'early_leave' | 'absent'
}

const STATUS_CONFIG = {
  not_started: {
    label: '未出勤',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-500',
    dotColor: 'bg-gray-300',
    borderColor: 'border-gray-200',
  },
  working: {
    label: '勤務中',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-200',
  },
  on_break: {
    label: '休憩中',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
  },
  finished: {
    label: '退勤済み',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
  },
} as const

const STATUS_BADGE = {
  normal: { label: '正常', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  late: { label: '遅刻', color: 'bg-red-50 text-red-700 border border-red-200' },
  early_leave: { label: '早退', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  absent: { label: '欠勤', color: 'bg-gray-50 text-gray-500 border border-gray-200' },
} as const

const MOCK_HISTORY: readonly HistoryRecord[] = [
  { date: '2026-05-09', dayOfWeek: '金', clockIn: '08:55', clockOut: '18:02', breakMin: 60, workHours: '8:07', status: 'normal' },
  { date: '2026-05-08', dayOfWeek: '木', clockIn: '09:12', clockOut: '18:30', breakMin: 60, workHours: '8:18', status: 'late' },
  { date: '2026-05-07', dayOfWeek: '水', clockIn: '08:50', clockOut: '17:30', breakMin: 60, workHours: '7:40', status: 'early_leave' },
  { date: '2026-05-06', dayOfWeek: '火', clockIn: '08:58', clockOut: '18:15', breakMin: 60, workHours: '8:17', status: 'normal' },
  { date: '2026-05-05', dayOfWeek: '月', clockIn: '09:00', clockOut: '18:00', breakMin: 60, workHours: '8:00', status: 'normal' },
  { date: '2026-05-02', dayOfWeek: '金', clockIn: '08:45', clockOut: '18:10', breakMin: 60, workHours: '8:25', status: 'normal' },
  { date: '2026-05-01', dayOfWeek: '木', clockIn: '09:08', clockOut: '18:05', breakMin: 60, workHours: '7:57', status: 'late' },
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDateJP(date: Date): string {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function formatRecordTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

export function ClockInPage() {
  const [now, setNow] = useState(() => new Date())
  const [status, setStatus] = useState<WorkStatus>('not_started')
  const [clockInTime, setClockInTime] = useState<string | null>(null)
  const [clockOutTime, setClockOutTime] = useState<string | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null)
  const [totalBreakMin, setTotalBreakMin] = useState(0)
  const [timeline, setTimeline] = useState<readonly ClockRecord[]>([])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const addTimelineRecord = (type: ClockRecord['type'], label: string) => {
    const record: ClockRecord = { type, time: new Date().toISOString(), label }
    setTimeline(prev => [...prev, record])
  }

  const handleClockIn = () => {
    const now = new Date().toISOString()
    setClockInTime(now)
    setStatus('working')
    addTimelineRecord('clock_in', '出勤')
  }

  const handleBreakStart = () => {
    setBreakStartTime(new Date().toISOString())
    setStatus('on_break')
    addTimelineRecord('break_start', '休憩開始')
  }

  const handleBreakEnd = () => {
    if (breakStartTime) {
      const breakDuration = Math.round((Date.now() - new Date(breakStartTime).getTime()) / 60000)
      setTotalBreakMin(prev => prev + breakDuration)
    }
    setBreakStartTime(null)
    setStatus('working')
    addTimelineRecord('break_end', '休憩終了')
  }

  const handleClockOut = () => {
    setClockOutTime(new Date().toISOString())
    setStatus('finished')
    addTimelineRecord('clock_out', '退勤')
  }

  const handleReset = () => {
    setStatus('not_started')
    setClockInTime(null)
    setClockOutTime(null)
    setBreakStartTime(null)
    setTotalBreakMin(0)
    setTimeline([])
  }

  const config = STATUS_CONFIG[status]

  const workMinutes = clockInTime
    ? Math.round((
        (clockOutTime ? new Date(clockOutTime).getTime() : Date.now()) - new Date(clockInTime).getTime()
      ) / 60000) - totalBreakMin
    : 0
  const workHoursDisplay = `${Math.floor(workMinutes / 60)}:${String(workMinutes % 60).padStart(2, '0')}`

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="grid grid-cols-3 gap-6">
        {/* 左: 打刻エリア (2カラム) */}
        <div className="col-span-2 space-y-6">
          {/* メイン打刻カード */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col items-center px-8 py-10">
              {/* 日付 */}
              <p className="mb-2 text-sm font-medium text-gray-400">{formatDateJP(now)}</p>

              {/* 現在時刻 */}
              <p className="mb-6 font-mono text-7xl font-bold tracking-tight text-gray-900">
                {formatTime(now)}
              </p>

              {/* 勤務ステータス */}
              <div className={`mb-8 flex items-center gap-2 rounded-full border px-5 py-2 ${config.bgColor} ${config.borderColor}`}>
                <span className={`h-2 w-2 rounded-full ${config.dotColor} ${
                  status === 'working' || status === 'on_break' ? 'animate-pulse' : ''
                }`} />
                <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
              </div>

              {/* 打刻ボタン */}
              <div className="flex items-center gap-4">
                {status === 'not_started' && (
                  <button
                    onClick={handleClockIn}
                    className="rounded-2xl bg-emerald-500 px-16 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 active:scale-[0.98]"
                  >
                    出勤する
                  </button>
                )}
                {status === 'working' && (
                  <>
                    <button
                      onClick={handleBreakStart}
                      className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-8 py-4 text-lg font-bold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.98]"
                    >
                      休憩開始
                    </button>
                    <button
                      onClick={handleClockOut}
                      className="rounded-2xl bg-red-500 px-12 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-red-500/40 active:scale-[0.98]"
                    >
                      退勤する
                    </button>
                  </>
                )}
                {status === 'on_break' && (
                  <button
                    onClick={handleBreakEnd}
                    className="rounded-2xl bg-amber-500 px-16 py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-600 active:scale-[0.98]"
                  >
                    休憩終了
                  </button>
                )}
                {status === 'finished' && (
                  <div className="text-center">
                    <p className="mb-3 text-lg font-semibold text-gray-500">本日の勤務は終了しました</p>
                    <button
                      onClick={handleReset}
                      className="text-sm text-gray-400 underline decoration-dashed underline-offset-4 hover:text-gray-600"
                    >
                      リセット（デモ用）
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 本日の記録サマリー */}
            {clockInTime && (
              <div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
                <div className="px-6 py-5 text-center">
                  <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">出勤時刻</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatRecordTime(clockInTime)}
                  </p>
                </div>
                <div className="px-6 py-5 text-center">
                  <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">退勤時刻</p>
                  <p className="text-xl font-bold text-gray-900">
                    {clockOutTime ? formatRecordTime(clockOutTime) : '--:--'}
                  </p>
                </div>
                <div className="px-6 py-5 text-center">
                  <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">休憩時間</p>
                  <p className="text-xl font-bold text-gray-900">{totalBreakMin}分</p>
                </div>
                <div className="px-6 py-5 text-center">
                  <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">実働時間</p>
                  <p className="text-xl font-bold text-blue-600">{workHoursDisplay}</p>
                </div>
              </div>
            )}
          </div>

          {/* 直近の勤務履歴 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900">直近の勤務履歴</h3>
              <span className="text-[11px] text-gray-400">過去7日間</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 text-left text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-3">日付</th>
                    <th className="px-4 py-3">出勤</th>
                    <th className="px-4 py-3">退勤</th>
                    <th className="px-4 py-3">休憩</th>
                    <th className="px-4 py-3">実働</th>
                    <th className="px-4 py-3">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_HISTORY.map(record => {
                    const badge = STATUS_BADGE[record.status]
                    return (
                      <tr key={record.date} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-gray-900">
                              {formatDateShort(record.date)}
                            </span>
                            <span className="text-[11px] text-gray-400">({record.dayOfWeek})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[13px] text-gray-700">{record.clockIn}</td>
                        <td className="px-4 py-3.5 font-mono text-[13px] text-gray-700">{record.clockOut}</td>
                        <td className="px-4 py-3.5 text-[13px] text-gray-500">{record.breakMin}分</td>
                        <td className="px-4 py-3.5 font-mono text-[13px] font-medium text-gray-900">{record.workHours}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.color}`}>
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

        {/* 右: タイムライン + 今月サマリー */}
        <div className="space-y-6">
          {/* 今月のサマリー */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">今月のサマリー</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">出勤日数</span>
                <span className="text-[15px] font-bold text-gray-900">8 / 20日</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '40%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">総勤務時間</span>
                <span className="text-[15px] font-bold text-gray-900">64:45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">残業時間</span>
                <span className="text-[15px] font-bold text-orange-500">4:45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">遅刻回数</span>
                <span className="text-[15px] font-bold text-red-500">2回</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">有給残日数</span>
                <span className="text-[15px] font-bold text-gray-900">12日</span>
              </div>
            </div>
          </div>

          {/* 本日のタイムライン */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">本日のタイムライン</h3>
            </div>
            <div className="p-5">
              {timeline.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-gray-400">
                  まだ打刻がありません
                </p>
              ) : (
                <div className="relative space-y-4 pl-6">
                  {/* 縦線 */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                  {timeline.map((record, i) => {
                    const dotColor =
                      record.type === 'clock_in' ? 'bg-emerald-500' :
                      record.type === 'clock_out' ? 'bg-red-500' :
                      'bg-amber-500'
                    return (
                      <div key={i} className="relative flex items-center gap-3">
                        <span className={`absolute -left-6 h-3.5 w-3.5 rounded-full border-2 border-white ${dotColor} shadow-sm`} />
                        <div>
                          <p className="text-[13px] font-medium text-gray-900">{record.label}</p>
                          <p className="font-mono text-[11px] text-gray-400">{formatRecordTime(record.time)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
