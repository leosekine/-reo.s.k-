'use client'

import { useState } from 'react'

interface MemberStatus {
  readonly id: string
  readonly name: string
  readonly department: string
  readonly status: 'working' | 'on_break' | 'not_started' | 'day_off' | 'finished'
  readonly clockIn: string | null
  readonly clockOut: string | null
  readonly lateDays: number
  readonly overtimeHours: number
  readonly avatar: string
}

interface AlertItem {
  readonly id: string
  readonly type: 'shift' | 'report' | 'overtime' | 'absence'
  readonly severity: 'warning' | 'error' | 'info'
  readonly message: string
  readonly time: string
  readonly target: string
}

const MEMBER_STATUS_CONFIG = {
  working: { label: '勤務中', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  on_break: { label: '休憩中', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  not_started: { label: '未出勤', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  day_off: { label: '休日', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-400' },
  finished: { label: '退勤済', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
} as const

const ALERT_CONFIG = {
  shift: { icon: 'calendar', label: 'シフト' },
  report: { icon: 'file', label: '日報' },
  overtime: { icon: 'clock', label: '残業' },
  absence: { icon: 'user', label: '欠勤' },
} as const

const SEVERITY_CONFIG = {
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: 'text-amber-500' },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-500' },
} as const

const MEMBERS: readonly MemberStatus[] = [
  { id: '1', name: '山田 太郎', department: '開発部', status: 'working', clockIn: '08:55', clockOut: null, lateDays: 1, overtimeHours: 5.0, avatar: '山' },
  { id: '2', name: '佐藤 花子', department: '開発部', status: 'working', clockIn: '09:00', clockOut: null, lateDays: 0, overtimeHours: 2.5, avatar: '佐' },
  { id: '3', name: '鈴木 一郎', department: 'デザイン部', status: 'on_break', clockIn: '08:50', clockOut: null, lateDays: 0, overtimeHours: 8.0, avatar: '鈴' },
  { id: '4', name: '田中 美咲', department: '営業部', status: 'not_started', clockIn: null, clockOut: null, lateDays: 3, overtimeHours: 15.0, avatar: '田' },
  { id: '5', name: '高橋 健太', department: '開発部', status: 'day_off', clockIn: null, clockOut: null, lateDays: 2, overtimeHours: 3.5, avatar: '高' },
  { id: '6', name: '伊藤 あゆみ', department: 'デザイン部', status: 'finished', clockIn: '08:45', clockOut: '17:50', lateDays: 0, overtimeHours: 1.0, avatar: '伊' },
  { id: '7', name: '渡辺 大輔', department: '営業部', status: 'working', clockIn: '08:58', clockOut: null, lateDays: 1, overtimeHours: 6.5, avatar: '渡' },
  { id: '8', name: '中村 さくら', department: '人事部', status: 'working', clockIn: '09:02', clockOut: null, lateDays: 0, overtimeHours: 0.5, avatar: '中' },
]

const ALERTS: readonly AlertItem[] = [
  { id: '1', type: 'shift', severity: 'warning', message: '山田 太郎のシフト申請（5/12）が未承認です', time: '2時間前', target: '山田 太郎' },
  { id: '2', type: 'shift', severity: 'warning', message: '佐藤 花子のシフト申請（5/13）が未承認です', time: '3時間前', target: '佐藤 花子' },
  { id: '3', type: 'report', severity: 'info', message: '田中 美咲の日報（5/9）が未提出です', time: '昨日', target: '田中 美咲' },
  { id: '4', type: 'overtime', severity: 'error', message: '田中 美咲の残業時間が15hを超えています', time: '今週', target: '田中 美咲' },
  { id: '5', type: 'absence', severity: 'error', message: '田中 美咲が未出勤です（10:00時点）', time: '1時間前', target: '田中 美咲' },
]

const WEEKLY_HOURS = [
  { week: '第1週 (5/1-5/2)', hours: 16, target: 16 },
  { week: '第2週 (5/5-5/9)', hours: 42, target: 40 },
  { week: '第3週 (5/12-5/16)', hours: 0, target: 40 },
  { week: '第4週 (5/19-5/23)', hours: 0, target: 40 },
] as const

const DEPARTMENT_STATS = [
  { name: '開発部', members: 4, avgHours: 8.2, lateRate: 5 },
  { name: 'デザイン部', members: 2, avgHours: 7.9, lateRate: 0 },
  { name: '営業部', members: 2, avgHours: 8.5, lateRate: 12 },
  { name: '人事部', members: 1, avgHours: 8.0, lateRate: 0 },
] as const

function AlertIcon({ type }: { readonly type: string }) {
  switch (type) {
    case 'calendar':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case 'file':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      )
    case 'clock':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      )
  }
}

export function DashboardPage() {
  const [dismissedAlerts, setDismissedAlerts] = useState<readonly string[]>([])

  const visibleAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id))
  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => [...prev, id])
  }

  const workingCount = MEMBERS.filter(m => m.status === 'working' || m.status === 'on_break').length
  const totalMembers = MEMBERS.length
  const avgWorkHours = 8.1
  const totalOvertime = MEMBERS.reduce((sum, m) => sum + m.overtimeHours, 0)
  const totalLate = MEMBERS.reduce((sum, m) => sum + m.lateDays, 0)

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* アラート通知 */}
      {visibleAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {visibleAlerts.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity]
            const alertCfg = ALERT_CONFIG[alert.type]
            return (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${sev.bg} ${sev.border}`}
              >
                <div className="flex items-center gap-3">
                  <span className={sev.icon}>
                    <AlertIcon type={alertCfg.icon} />
                  </span>
                  <span className={`text-[13px] ${sev.text}`}>{alert.message}</span>
                  <span className="text-[11px] text-gray-400">{alert.time}</span>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* 統計カード */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wider text-gray-400">現在の出勤者</p>
              <p className="mt-2 text-3xl font-bold text-indigo-600">
                {workingCount}<span className="ml-1 text-sm font-normal text-gray-400">/{totalMembers}人</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${(workingCount / totalMembers) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wider text-gray-400">平均勤務時間</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {avgWorkHours}<span className="ml-1 text-sm font-normal text-gray-400">h/日</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-400">所定: 8.0h / 前月比: <span className="text-emerald-500">+0.1h</span></p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wider text-gray-400">遅刻回数</p>
              <p className="mt-2 text-3xl font-bold text-red-500">
                {totalLate}<span className="ml-1 text-sm font-normal text-gray-400">回</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-400">前月: 8回 / <span className="text-emerald-500">-1回改善</span></p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wider text-gray-400">チーム残業合計</p>
              <p className="mt-2 text-3xl font-bold text-orange-500">
                {totalOvertime}<span className="ml-1 text-sm font-normal text-gray-400">h</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-gray-400">上限: 360h/年 / 月平均: {(totalOvertime / 5).toFixed(1)}h</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* メンバー一覧 (2カラム) */}
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">メンバー勤務状況</h3>
            <span className="text-[11px] text-gray-400">{totalMembers}名</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-left text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">メンバー</th>
                  <th className="px-4 py-3">部署</th>
                  <th className="px-4 py-3">ステータス</th>
                  <th className="px-4 py-3">出勤</th>
                  <th className="px-4 py-3">退勤</th>
                  <th className="px-4 py-3">遅刻</th>
                  <th className="px-4 py-3">残業</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MEMBERS.map(member => {
                  const cfg = MEMBER_STATUS_CONFIG[member.status]
                  return (
                    <tr key={member.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[11px] font-bold text-gray-600">
                            {member.avatar}
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
                          </div>
                          <span className="text-[13px] font-medium text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-gray-500">{member.department}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${
                            member.status === 'working' || member.status === 'on_break' ? 'animate-pulse' : ''
                          }`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-gray-600">{member.clockIn ?? '-'}</td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-gray-600">{member.clockOut ?? '-'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[12px] ${member.lateDays > 0 ? 'font-semibold text-red-500' : 'text-gray-400'}`}>
                          {member.lateDays}回
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[12px] ${member.overtimeHours > 10 ? 'font-semibold text-orange-500' : 'text-gray-600'}`}>
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

        {/* 右カラム */}
        <div className="space-y-6">
          {/* 週別勤務時間 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">週別勤務時間（チーム平均）</h3>
            </div>
            <div className="space-y-4 p-5">
              {WEEKLY_HOURS.map(w => {
                const maxBar = 50
                const pct = Math.min((w.hours / maxBar) * 100, 100)
                const isOver = w.hours > w.target
                return (
                  <div key={w.week}>
                    <div className="mb-1.5 flex justify-between text-[11px]">
                      <span className="text-gray-500">{w.week}</span>
                      <span className={`font-semibold ${isOver ? 'text-orange-500' : w.hours > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                        {w.hours}h
                      </span>
                    </div>
                    <div className="relative h-4 rounded-lg bg-gray-100">
                      {w.hours > 0 && (
                        <div
                          className={`h-full rounded-lg transition-all ${isOver ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      {w.target > 0 && (
                        <div
                          className="absolute top-0 h-full border-l-2 border-dashed border-gray-300"
                          style={{ left: `${(w.target / maxBar) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500" />実績</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-orange-500" />超過</span>
                <span className="flex items-center gap-1"><span className="border-l-2 border-dashed border-gray-300 py-1" />所定40h</span>
              </div>
            </div>
          </div>

          {/* 部署別統計 */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">部署別統計</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {DEPARTMENT_STATS.map(dept => (
                <div key={dept.name} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <span className="text-[13px] font-medium text-gray-900">{dept.name}</span>
                    <span className="ml-2 text-[11px] text-gray-400">{dept.members}名</span>
                  </div>
                  <div className="flex items-center gap-4 text-[12px]">
                    <span className="text-gray-600">{dept.avgHours}h/日</span>
                    <span className={`font-medium ${dept.lateRate > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      遅刻率{dept.lateRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
