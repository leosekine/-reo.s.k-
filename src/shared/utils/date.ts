import { WORK_RULES } from '@/shared/constants/config'

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}時間${mins}分`
}

export function isLateArrival(clockInTime: Date): boolean {
  const startTime = new Date(clockInTime)
  startTime.setHours(WORK_RULES.startHour, WORK_RULES.startMinute, 0, 0)
  const thresholdMs = WORK_RULES.lateThresholdMinutes * 60 * 1000
  return clockInTime.getTime() > startTime.getTime() + thresholdMs
}

export function isEarlyDeparture(clockOutTime: Date): boolean {
  const endTime = new Date(clockOutTime)
  endTime.setHours(WORK_RULES.endHour, WORK_RULES.endMinute, 0, 0)
  return clockOutTime.getTime() < endTime.getTime()
}

export function calculateWorkMinutes(clockIn: Date, clockOut: Date): number {
  const diffMs = clockOut.getTime() - clockIn.getTime()
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  return Math.max(0, totalMinutes - WORK_RULES.breakMinutes)
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}
