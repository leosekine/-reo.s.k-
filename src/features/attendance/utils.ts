import { isLateArrival, isEarlyDeparture, calculateWorkMinutes } from '@/shared/utils/date'
import type { AttendanceRecord, TodayStatus, WorkStatus } from './types'

export function detectAnomalies(clockIn: Date, clockOut: Date | null): {
  isLate: boolean
  isEarlyLeave: boolean
} {
  return {
    isLate: isLateArrival(clockIn),
    isEarlyLeave: clockOut ? isEarlyDeparture(clockOut) : false,
  }
}

export function buildAttendanceRecord(
  id: string,
  date: string,
  clockIn: string,
  clockOut: string | null
): AttendanceRecord {
  const clockInDate = new Date(clockIn)
  const clockOutDate = clockOut ? new Date(clockOut) : null
  const anomalies = detectAnomalies(clockInDate, clockOutDate)

  return {
    id,
    date,
    clockIn,
    clockOut,
    workMinutes: clockOutDate
      ? calculateWorkMinutes(clockInDate, clockOutDate)
      : null,
    isLate: anomalies.isLate,
    isEarlyLeave: anomalies.isEarlyLeave,
  }
}

export function determineTodayStatus(
  clockIn: string | null,
  clockOut: string | null
): WorkStatus {
  if (!clockIn) return 'not_started'
  if (!clockOut) return 'working'
  return 'finished'
}

export function buildTodayStatus(
  clockIn: string | null,
  clockOut: string | null
): TodayStatus {
  return {
    status: determineTodayStatus(clockIn, clockOut),
    clockInTime: clockIn,
    clockOutTime: clockOut,
  }
}
