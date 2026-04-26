export type ClockAction = 'clock_in' | 'clock_out'

export type WorkStatus = 'not_started' | 'working' | 'finished'

export interface AttendanceRecord {
  readonly id: string
  readonly date: string
  readonly clockIn: string | null
  readonly clockOut: string | null
  readonly workMinutes: number | null
  readonly isLate: boolean
  readonly isEarlyLeave: boolean
}

export interface TodayStatus {
  readonly status: WorkStatus
  readonly clockInTime: string | null
  readonly clockOutTime: string | null
}
