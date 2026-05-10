'use client'

import { useAttendanceStore } from '@/shared/stores/attendance-store'

interface MemberStatus {
  readonly name: string
  readonly department: string
  readonly status: 'working' | 'on_break' | 'not_started' | 'day_off' | 'finished'
  readonly clockIn: string | null
  readonly clockOut: string | null
}

const MEMBER_STATUS_CONFIG = {
  working: { label: '勤務中', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  on_break: { label: '休憩中', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  not_started: { label: '未出勤', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  day_off: { label: '休日', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-400' },
  finished: { label: '退勤済', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
} as const

const MEMBERS: readonly MemberStatus[] = [
  { name: '山田 太郎', department: '開発部', status: 'working', clockIn: '08:55', clockOut: null },
  { name: '佐藤 花子', department: '開発部', status: 'working', clockIn: '09:00', clockOut: null },
  { name: '鈴木 一郎', department: 'デザイン部', status: 'on_break', clockIn: '08:50', clockOut: null },
  { name: '田中 美咲', department: '営業部', status: 'not_started', clockIn: null, clockOut: null },
  { name: '高橋 健太', department: '開発部', status: 'day_off', clockIn: null, clockOut: null },
  { name: '伊藤 あゆみ', department: 'デザイン部', status: 'finished', clockIn: '08:45', clockOut: '17:50' },
  { name: '渡辺 大輔', department: '営業部', status: 'working', clockIn: '08:58', clockOut: null },
  { name: '中村 さくら', department: '人事部', status: 'working', clockIn: '09:02', clockOut: null },
]

const WEEKLY_HOURS = [
  { week: '第1週', hours: 16, target: 16 },
  { week: '第2週', hours: 42, target: 40 },
  { week: '第3週', hours: 0, target: 40 },
  { week: '第4週', hours: 0, target: 40 },
] as const

export function DashboardPage() {
  const { entries } = useAttendanceStore()

  // 今月のデータを集計
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthEntries = entries.filter(e => {
    const d = new Date(e.date + 'T00:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const attendanceDays = monthEntries.filter(e => e.workHours > 0).length
  const lateCount = monthEntries.filter(e => e.type === 'late').length
  const totalWorkHours = monthEntries.reduce((sum, e) => sum + e.workHours, 0)
  const overtimeHours = Math.max(totalWorkHours - (attendanceDays * 8), 0)
  const overtimeDisplay = Math.round(overtimeHours * 10) / 10

  const workingCount = MEMBERS.filter(m => m.status === 'working' || m.status === 'on_break').length

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* 3大指標 */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        {/* 出勤日数 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-gray-400">今月の出勤日数</p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">{attendanceDays}</span>
                <span className="text-lg text-gray-400">/ 20日</span>
              </p>
              <p className="mt-2 text-[12px] text-gray-400">
                残り {Math.max(20 - attendanceDays, 0)}日
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          {/* プログレスバー */}
          <div className="mt-4 h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((attendanceDays / 20) * 100, 100)}%` }} />
          </div>
        </div>

        {/* 遅刻回数 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-gray-400">今月の遅刻回数</p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className={`text-5xl font-bold ${lateCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>{lateCount}</span>
                <span className="text-lg text-gray-400">回</span>
              </p>
              <p className="mt-2 text-[12px] text-gray-400">
                {lateCount === 0 ? '遅刻なし' : `出勤${attendanceDays}日中`}
              </p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${lateCount > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {lateCount > 0 ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </div>
          </div>
          {/* 遅刻率バー */}
          <div className="mt-4 h-2 rounded-full bg-gray-100">
            <div className={`h-2 rounded-full transition-all ${lateCount > 0 ? 'bg-red-400' : 'bg-emerald-400'}`}
              style={{ width: `${attendanceDays > 0 ? (lateCount / attendanceDays) * 100 : 0}%` }} />
          </div>
        </div>

        {/* 残業時間 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-gray-400">今月の残業時間</p>
              <p className="mt-3 flex items-baseline gap-1">
                <span className={`text-5xl font-bold ${overtimeDisplay > 20 ? 'text-orange-500' : 'text-gray-900'}`}>{overtimeDisplay}</span>
                <span className="text-lg text-gray-400">時間</span>
              </p>
              <p className="mt-2 text-[12px] text-gray-400">
                上限 45h / 残り {Math.max(45 - overtimeDisplay, 0).toFixed(1)}h
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          {/* 残業上限バー */}
          <div className="mt-4 h-2 rounded-full bg-gray-100">
            <div className={`h-2 rounded-full transition-all ${overtimeDisplay > 30 ? 'bg-red-400' : overtimeDisplay > 20 ? 'bg-orange-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min((overtimeDisplay / 45) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* メンバー状況 (2カラム) */}
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">メンバー勤務状況</h3>
            <span className="text-[11px] text-gray-400">
              出勤中 {workingCount}/{MEMBERS.length}名
            </span>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MEMBERS.map(member => {
                  const cfg = MEMBER_STATUS_CONFIG[member.status]
                  return (
                    <tr key={member.name} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-[11px] font-bold text-gray-600">
                            {member.name.charAt(0)}
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
              <h3 className="text-sm font-semibold text-gray-900">週別勤務時間</h3>
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
                        <div className="absolute top-0 h-full border-l-2 border-dashed border-gray-300" style={{ left: `${(w.target / maxBar) * 100}%` }} />
                      )}
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500" />実績</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-orange-500" />超過</span>
                <span className="flex items-center gap-1"><span className="border-l-2 border-dashed border-gray-300 py-1" />所定</span>
              </div>
            </div>
          </div>

          {/* 勤務サマリー */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">今月の勤務サマリー</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[12px] text-gray-500">総勤務時間</span>
                <span className="text-[13px] font-bold text-gray-900">{totalWorkHours.toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[12px] text-gray-500">平均勤務時間</span>
                <span className="text-[13px] font-bold text-gray-900">{attendanceDays > 0 ? (totalWorkHours / attendanceDays).toFixed(1) : '0.0'}h/日</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[12px] text-gray-500">有給取得</span>
                <span className="text-[13px] font-bold text-gray-900">{monthEntries.filter(e => e.type === 'paid_leave').length}日</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[12px] text-gray-500">早退</span>
                <span className="text-[13px] font-bold text-gray-900">{monthEntries.filter(e => e.type === 'early_leave').length}回</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
