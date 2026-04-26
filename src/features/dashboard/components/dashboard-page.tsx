'use client'

import { useState } from 'react'

interface MonthlyStats {
  readonly label: string
  readonly attendanceDays: number
  readonly lateDays: number
  readonly overtimeHours: number
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

const BAR_MAX = 50

interface StatCardProps {
  readonly label: string
  readonly value: number
  readonly unit: string
  readonly colorClass: string
  readonly bgClass: string
  readonly prev: number
}

function StatCard({ label, value, unit, colorClass, bgClass, prev }: StatCardProps) {
  const diff = value - prev
  const diffLabel = diff > 0 ? `+${diff}` : `${diff}`
  const diffColor = diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-gray-400'

  // 遅刻・残業は減少が良い → 色を逆に
  const isPositiveGood = label === '出勤日数'
  const adjustedColor = isPositiveGood
    ? (diff >= 0 ? 'text-green-500' : 'text-red-500')
    : diffColor

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${bgClass}`}>
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

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">ダッシュボード画面</h2>

      {/* 統計カード */}
      <div className="mb-10 grid grid-cols-3 gap-5">
        <StatCard
          label="出勤日数"
          value={current.attendanceDays}
          unit="日"
          colorClass="text-blue-600"
          bgClass="bg-white border-gray-200"
          prev={prev.attendanceDays}
        />
        <StatCard
          label="遅刻回数"
          value={current.lateDays}
          unit="回"
          colorClass="text-red-600"
          bgClass="bg-white border-gray-200"
          prev={prev.lateDays}
        />
        <StatCard
          label="残業時間"
          value={current.overtimeHours}
          unit="時間"
          colorClass="text-orange-500"
          bgClass="bg-white border-gray-200"
          prev={prev.overtimeHours}
        />
      </div>

      {/* 週別勤務時間グラフ */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold text-gray-900">週別勤務時間</h3>
        <div className="space-y-4">
          {WEEKLY_HOURS.map(w => {
            const pct = Math.min((w.hours / BAR_MAX) * 100, 100)
            const isOver = w.hours > 40

            return (
              <div key={w.week} className="flex items-center gap-4">
                <span className="w-16 shrink-0 text-sm text-gray-600">{w.week}</span>
                <div className="relative h-8 flex-1 rounded-lg bg-gray-100">
                  <div
                    className={`h-full rounded-lg transition-all ${isOver ? 'bg-orange-400' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                  {/* 40時間ライン */}
                  <div
                    className="absolute top-0 h-full border-l-2 border-dashed border-gray-400"
                    style={{ left: `${(40 / BAR_MAX) * 100}%` }}
                  />
                </div>
                <span className={`w-16 shrink-0 text-right text-sm font-semibold ${isOver ? 'text-orange-500' : 'text-gray-700'}`}>
                  {w.hours}h
                </span>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-gray-400">点線 = 所定労働時間（40h）</p>
      </div>
    </div>
  )
}
