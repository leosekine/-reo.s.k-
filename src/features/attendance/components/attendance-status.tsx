'use client'

import { formatTime } from '@/shared/utils/date'
import { Badge } from '@/shared/components/ui/badge'
import { Card } from '@/shared/components/ui/card'
import { isLateArrival, isEarlyDeparture } from '@/shared/utils/date'
import type { TodayStatus } from '../types'

interface AttendanceStatusProps {
  readonly todayStatus: TodayStatus
}

const STATUS_LABELS = {
  not_started: '未出勤',
  working: '勤務中',
  finished: '退勤済み',
} as const

const STATUS_BADGE_VARIANT = {
  not_started: 'neutral',
  working: 'success',
  finished: 'info',
} as const

export function AttendanceStatus({ todayStatus }: AttendanceStatusProps) {
  const { status, clockInTime, clockOutTime } = todayStatus

  const clockInDate = clockInTime ? new Date(clockInTime) : null
  const clockOutDate = clockOutTime ? new Date(clockOutTime) : null
  const isLate = clockInDate ? isLateArrival(clockInDate) : false
  const isEarly = clockOutDate ? isEarlyDeparture(clockOutDate) : false

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">本日のステータス</h3>
        <Badge variant={STATUS_BADGE_VARIANT[status]}>
          {STATUS_LABELS[status]}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">出勤時刻</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-gray-900">
              {clockInDate ? formatTime(clockInDate) : '--:--'}
            </p>
            {isLate && <Badge variant="warning">遅刻</Badge>}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">退勤時刻</p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-gray-900">
              {clockOutDate ? formatTime(clockOutDate) : '--:--'}
            </p>
            {isEarly && <Badge variant="error">早退</Badge>}
          </div>
        </div>
      </div>
    </Card>
  )
}
