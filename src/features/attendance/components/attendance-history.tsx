'use client'

import { formatTime, formatDate, formatDuration } from '@/shared/utils/date'
import { Badge } from '@/shared/components/ui/badge'
import { Card } from '@/shared/components/ui/card'
import type { AttendanceRecord } from '../types'

interface AttendanceHistoryProps {
  readonly records: readonly AttendanceRecord[]
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  if (records.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-gray-500">勤怠履歴がありません</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-medium text-gray-500">直近の勤怠履歴</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="pb-2 font-medium">日付</th>
              <th className="pb-2 font-medium">出勤</th>
              <th className="pb-2 font-medium">退勤</th>
              <th className="pb-2 font-medium">勤務時間</th>
              <th className="pb-2 font-medium">状態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map(record => (
              <tr key={record.id}>
                <td className="py-3 text-gray-900">
                  {formatDate(new Date(record.date))}
                </td>
                <td className="py-3 text-gray-700">
                  {record.clockIn ? formatTime(new Date(record.clockIn)) : '--:--'}
                </td>
                <td className="py-3 text-gray-700">
                  {record.clockOut ? formatTime(new Date(record.clockOut)) : '--:--'}
                </td>
                <td className="py-3 text-gray-700">
                  {record.workMinutes != null ? formatDuration(record.workMinutes) : '-'}
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {record.isLate && <Badge variant="warning">遅刻</Badge>}
                    {record.isEarlyLeave && <Badge variant="error">早退</Badge>}
                    {!record.isLate && !record.isEarlyLeave && (
                      <Badge variant="success">正常</Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
