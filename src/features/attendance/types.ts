export type WorkStatus = 'not_started' | 'working' | 'finished'

export interface TodayStatus {
  readonly status: WorkStatus
  readonly clockInTime: string | null
  readonly clockOutTime: string | null
}

export interface HistoryRecord {
  readonly date: string
  readonly dayOfWeek: string
  readonly clockIn: string
  readonly clockOut: string
  readonly breakMin: number
  readonly workHours: string
  readonly status: 'normal' | 'late' | 'early_leave' | 'absent'
}

export interface TimelineRecord {
  readonly type: 'clock_in' | 'clock_out'
  readonly time: string
  readonly label: string
}

export const STATUS_CONFIG = {
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
  finished: {
    label: '退勤済み',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
  },
} as const

export const HISTORY_STATUS_BADGE = {
  normal: { label: '正常', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  late: { label: '遅刻', color: 'bg-red-50 text-red-700 border border-red-200' },
  early_leave: { label: '早退', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  absent: { label: '欠勤', color: 'bg-gray-50 text-gray-500 border border-gray-200' },
} as const
