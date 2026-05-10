import type { WorkStatus, TodayStatus } from './types'

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
