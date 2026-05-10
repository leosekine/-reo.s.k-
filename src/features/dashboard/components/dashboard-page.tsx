'use client'

import { useState } from 'react'

interface MonthlyStats {
  readonly label: string
  readonly attendanceDays: number
  readonly lateDays: number
  readonly overtimeHours: number
}

interface MemberStatus {
  readonly name: string
  readonly status: 'working' | 'on_break' | 'not_started' | 'day_off' | 'finished'
  readonly clockIn: string | null
  readonly lateDays: number
  readonly overtimeHours: number
}

interface AlertItem {
  readonly id: string
  readonly type: 'shift' | 'report' | 'overtime'
  readonly message: string
  readonly time: string
}

const STATS: readonly MonthlyStats[] = [
  { label: '今月', attendanceDays: 18, lateDays: 2, overtimeHours: 12.5 },
  { label: '前月', attendanceDays: 21, lateDays: 4, overtimeHours: 18.0 },
]

const WEEKLY_HOURS = [
  { week: '第1週', hours: 40 },
  { week: '第2週', hours: 44 },
  { week: '第3週', hours: 38 },
  { week: '第4週', hours: 42 },
] as const

const MEMBERS: readonly MemberStatus[] = [
  { name: '山田 太郎', status: 'working', clockIn: '08:55', lateDays: 1, overtimeHours: 5.0 },
  { name: '佐藤 花子', status: 'working', clockIn: '09:00', lateDays: 0, overtimeHours: 2.5 },
  { name: '鈴木 一郎', status: 'on_break', clockIn: '08:50', lateDays: 0, overtimeHours: 8.0 },
  { name: '田中 美咲', status: 'not_started', clockIn: null, lateDays: 3, overtimeHours: 15.0 },
  { name: '高橋 健太', status: 'day_off', clockIn: null, lateDays: 2, overtimeHours: 3.5 },
  { name: '伊藤 あゆみ', status: 'finished', clockIn: '08:45', lateDays: 0, overtimeHours: 1.0 },
]

const ALERTS: readonly AlertItem[] = [
  { id: '1', type: 'shift', message: '山田 太郎のシフト申請（5/12）が未承認です', time: '2時間前' },
  { id: '2', type: 'shift', message: '佐藤 花子のシフト申請（5/13）が未承認です', time: '3時間前' },
  { id: '3', type: 'report', message: '田中 美咲の日報（5/9）が未提出です', time: '昨日' },
  { id: '4', type: 'overtime', message: '田中 美咲の残業時間が15hを超えています', time: '今週' },
]

const MEMBER_STATUS_CONFIG = {
  working: { label: '勤務中', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  on_break: { label: '休憩中', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  not_started: { label: '未出勤', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  day_off: { label: '休日', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  finished: { label: '退勤済', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
} as const

const ALERT_ICON = {
  shift: '📅',
  report: '📝',
  overtime: '⚠️',
} as const

const BAR_MAX = 50

interface StatCardProps {
  readonly label: string
  readonly value: number
  readonly unit: string
  readonly colorClass: string
  readonly prev: number
}

function StatCard({ label, value, unit, colorClass, prev }: StatCardProps) {
  const diff = value - prev
  const diffLabel = diff > 0 ? `+${diff}` : `${diff}`
  const diffColor = diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-400'

  const isPositiveGood = label === '出勤日数'
  const adjustedColor = isPositiveGood
    ? (diff >= 0 ? 'text-green-500' : 'text-red-500')
    : diffColor

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${colorClass}`}>
        {value}<span className="ml-1 text-base font-normal text-gray-500">{unit}</span>
      </p>
      <p className={`mt-2 text-xs font-medium ${adjustedColor}`}>
        前月比 {diffLabel}{unit}
      </p>
    </div>
  )
}

export function DashboardPage() {
  const [current] = useState(STATS[0])
  const [prev] = useState(STATS[1])
  const [dismissedAlerts, setDismissedAlerts] = useState<readonly string[]>([])

  const visibleAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id))

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => [...prev, id])
  }

  const workingCount = MEMBERS.filter(m => m.status === 'working' || m.status === 'on_break').length

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* アラート通知 */}
      {visibleAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {visibleAlerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{ALERT_ICON[alert.type]}</span>
                <span className="text-sm text-orange-900">{alert.message}</span>
                <span className="text-xs text-orange-400">{alert.time}</span>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="text-sm text-orange-400 hover:text-orange-600"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 統計カード */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">現在の出勤者</p>
          <p className="mt-2 text-4xl font-bold text-indigo-600">
            {workingCount}<span className="ml-1 text-base font-normal text-gray-500">/{MEMBERS.length}人</span>
          </p>
        </div>
        <StatCard
          label="出勤日数"
          value={current.attendanceDays}
          unit="日"
          colorClass="text-blue-600"
          prev={prev.attendanceDays}
        />
        <StatCard
          label="遅刻回数"
          value={current.lateDays}
          unit="回"
          colorClass="text-red-600"
          prev={prev.lateDays}
        />
        <StatCard
          label="残業時間"
          value={current.overtimeHours}
          unit="時間"
          colorClass="text-orange-500"
          prev={prev.overtimeHours}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* メンバー一覧（2カラム分） */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">メンバー勤務状況</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500">
                  <th className="pb-3 pr-4">名前</th>
                  <th className="pb-3 pr-4">ステータス</th>
                  <th className="pb-3 pr-4">出勤時刻</th>
                  <th className="pb-3 pr-4">遅刻</th>
                  <th className="pb-3">残業</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MEMBERS.map(member => {
                  const cfg = MEMBER_STATUS_CONFIG[member.status]
                  return (
                    <tr key={member.name} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{member.clockIn ?? '-'}</td>
                      <td className="py-3 pr-4">
                        <span className={member.lateDays > 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                          {member.lateDays}回
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={member.overtimeHours > 10 ? 'font-semibold text-orange-600' : 'text-gray-700'}>
                          {member.overtimeHours}h
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 週別勤務時間グラフ（1カラム分） */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">週別勤務時間</h3>
          <div className="space-y-3">
            {WEEKLY_HOURS.map(w => {
              const pct = Math.min((w.hours / BAR_MAX) * 100, 100)
              const isOver = w.hours > 40

              return (
                <div key={w.week}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-gray-600">{w.week}</span>
                    <span className={`font-semibold ${isOver ? 'text-orange-500' : 'text-gray-700'}`}>
                      {w.hours}h
                    </span>
                  </div>
                  <div className="relative h-5 rounded-md bg-gray-100">
                    <div
                      className={`h-full rounded-md transition-all ${isOver ? 'bg-orange-400' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute top-0 h-full border-l-2 border-dashed border-gray-300"
                      style={{ left: `${(40 / BAR_MAX) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-gray-400">点線 = 所定40h</p>
        </div>
      </div>
    </div>
  )
}
