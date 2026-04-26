import type { AttendanceRecord } from './types'

function createDate(daysAgo: number, hour: number, minute: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const MOCK_ATTENDANCE_HISTORY: readonly AttendanceRecord[] = [
  {
    id: '1',
    date: createDate(1, 0, 0).split('T')[0],
    clockIn: createDate(1, 8, 55),
    clockOut: createDate(1, 18, 5),
    workMinutes: 490,
    isLate: false,
    isEarlyLeave: false,
  },
  {
    id: '2',
    date: createDate(2, 0, 0).split('T')[0],
    clockIn: createDate(2, 9, 15),
    clockOut: createDate(2, 18, 0),
    workMinutes: 465,
    isLate: true,
    isEarlyLeave: false,
  },
  {
    id: '3',
    date: createDate(3, 0, 0).split('T')[0],
    clockIn: createDate(3, 8, 50),
    clockOut: createDate(3, 17, 30),
    workMinutes: 460,
    isLate: false,
    isEarlyLeave: true,
  },
  {
    id: '4',
    date: createDate(4, 0, 0).split('T')[0],
    clockIn: createDate(4, 9, 0),
    clockOut: createDate(4, 18, 10),
    workMinutes: 490,
    isLate: false,
    isEarlyLeave: false,
  },
  {
    id: '5',
    date: createDate(5, 0, 0).split('T')[0],
    clockIn: createDate(5, 8, 45),
    clockOut: createDate(5, 19, 0),
    workMinutes: 555,
    isLate: false,
    isEarlyLeave: false,
  },
]
