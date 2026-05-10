import type { HistoryRecord } from '../types'
import { HISTORY_STATUS_BADGE } from '../types'

interface WorkHistoryProps {
  readonly records: readonly HistoryRecord[]
}

function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[1]}/${parts[2]}`
}

export function WorkHistory({ records }: WorkHistoryProps) {
  return (
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
            {records.map(record => {
              const badge = HISTORY_STATUS_BADGE[record.status]
              return (
                <tr key={record.date} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-gray-900">{formatDateShort(record.date)}</span>
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
  )
}
