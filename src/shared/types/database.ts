export type Role = 'member' | 'admin'

export type AttendanceType = 'clock_in' | 'clock_out'

export type ShiftStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly role: Role
  readonly department: string
  readonly created_at: string
  readonly updated_at: string
}

export interface Attendance {
  readonly id: string
  readonly user_id: string
  readonly type: AttendanceType
  readonly timestamp: string
  readonly latitude: number | null
  readonly longitude: number | null
  readonly is_late: boolean
  readonly is_early_leave: boolean
  readonly note: string | null
  readonly created_at: string
}

export interface Shift {
  readonly id: string
  readonly user_id: string
  readonly date: string
  readonly start_time: string
  readonly end_time: string
  readonly status: ShiftStatus
  readonly note: string | null
  readonly created_at: string
  readonly updated_at: string
}

export interface AiInsight {
  readonly id: string
  readonly type: string
  readonly content: string
  readonly severity: 'info' | 'warning' | 'critical'
  readonly created_at: string
}

export interface ActionLog {
  readonly id: string
  readonly user_id: string
  readonly action: string
  readonly detail: string
  readonly created_at: string
}
