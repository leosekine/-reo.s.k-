'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface AttendanceEntry {
  readonly date: string
  readonly type: 'normal' | 'late' | 'early_leave' | 'paid_leave'
  readonly clockIn: string
  readonly clockOut: string
  readonly breakMin: number
  readonly workHours: number
}

interface AttendanceStoreState {
  readonly entries: readonly AttendanceEntry[]
  readonly todayClockIn: string | null
  readonly todayClockOut: string | null
  readonly todayStatus: 'not_started' | 'working' | 'finished'
}

interface AttendanceStoreActions {
  readonly clockIn: () => void
  readonly clockOut: () => void
  readonly reset: () => void
}

type AttendanceStore = AttendanceStoreState & AttendanceStoreActions

const STORAGE_KEY = 'attendance_entries'
const TODAY_KEY = 'attendance_today'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function isLate(clockIn: string): boolean {
  const d = new Date(clockIn)
  return d.getHours() > 9 || (d.getHours() === 9 && d.getMinutes() > 5)
}

// 固定ダミーデータ
const SEED_ENTRIES: readonly AttendanceEntry[] = [
  { date: '2026-05-09', type: 'normal', clockIn: '08:55', clockOut: '18:02', breakMin: 60, workHours: 8.1 },
  { date: '2026-05-08', type: 'late', clockIn: '09:12', clockOut: '18:30', breakMin: 60, workHours: 8.3 },
  { date: '2026-05-07', type: 'normal', clockIn: '08:50', clockOut: '17:30', breakMin: 60, workHours: 7.7 },
  { date: '2026-05-06', type: 'normal', clockIn: '08:55', clockOut: '18:00', breakMin: 60, workHours: 8.1 },
  { date: '2026-05-05', type: 'late', clockIn: '09:15', clockOut: '18:20', breakMin: 60, workHours: 8.1 },
  { date: '2026-05-02', type: 'normal', clockIn: '08:48', clockOut: '18:10', breakMin: 60, workHours: 8.4 },
  { date: '2026-05-01', type: 'normal', clockIn: '08:52', clockOut: '18:05', breakMin: 60, workHours: 8.2 },
  { date: '2026-04-30', type: 'normal', clockIn: '08:50', clockOut: '18:00', breakMin: 60, workHours: 8.2 },
  { date: '2026-04-29', type: 'normal', clockIn: '08:48', clockOut: '18:10', breakMin: 60, workHours: 8.4 },
  { date: '2026-04-28', type: 'normal', clockIn: '08:55', clockOut: '18:00', breakMin: 60, workHours: 8.1 },
  { date: '2026-04-27', type: 'normal', clockIn: '08:50', clockOut: '18:05', breakMin: 60, workHours: 8.3 },
  { date: '2026-04-24', type: 'normal', clockIn: '08:52', clockOut: '18:00', breakMin: 60, workHours: 8.1 },
  { date: '2026-04-23', type: 'late', clockIn: '09:08', clockOut: '18:20', breakMin: 60, workHours: 8.2 },
  { date: '2026-04-22', type: 'normal', clockIn: '08:48', clockOut: '18:10', breakMin: 60, workHours: 8.4 },
  { date: '2026-04-21', type: 'normal', clockIn: '08:55', clockOut: '18:00', breakMin: 60, workHours: 8.1 },
  { date: '2026-04-20', type: 'normal', clockIn: '08:50', clockOut: '18:15', breakMin: 60, workHours: 8.4 },
  { date: '2026-04-17', type: 'normal', clockIn: '08:45', clockOut: '18:00', breakMin: 60, workHours: 8.3 },
  { date: '2026-04-16', type: 'normal', clockIn: '08:58', clockOut: '18:05', breakMin: 60, workHours: 8.1 },
  { date: '2026-04-15', type: 'paid_leave', clockIn: '-', clockOut: '-', breakMin: 0, workHours: 0 },
  { date: '2026-04-14', type: 'normal', clockIn: '08:50', clockOut: '18:00', breakMin: 60, workHours: 8.2 },
  { date: '2026-04-13', type: 'normal', clockIn: '08:55', clockOut: '18:10', breakMin: 60, workHours: 8.3 },
  { date: '2026-04-10', type: 'early_leave', clockIn: '08:50', clockOut: '16:30', breakMin: 60, workHours: 6.7 },
  { date: '2026-04-09', type: 'normal', clockIn: '08:52', clockOut: '18:00', breakMin: 60, workHours: 8.1 },
  { date: '2026-04-08', type: 'normal', clockIn: '08:48', clockOut: '18:05', breakMin: 60, workHours: 8.3 },
  { date: '2026-04-07', type: 'late', clockIn: '09:20', clockOut: '18:15', breakMin: 60, workHours: 7.9 },
  { date: '2026-04-06', type: 'normal', clockIn: '08:55', clockOut: '18:00', breakMin: 60, workHours: 8.1 },
  { date: '2026-04-03', type: 'normal', clockIn: '08:45', clockOut: '18:10', breakMin: 60, workHours: 8.4 },
  { date: '2026-04-02', type: 'normal', clockIn: '08:50', clockOut: '18:00', breakMin: 60, workHours: 8.2 },
  { date: '2026-04-01', type: 'normal', clockIn: '08:58', clockOut: '18:05', breakMin: 60, workHours: 8.1 },
]

function loadEntries(): readonly AttendanceEntry[] {
  if (typeof window === 'undefined') return SEED_ENTRIES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return SEED_ENTRIES
}

function loadToday(): { clockIn: string | null; clockOut: string | null } {
  if (typeof window === 'undefined') return { clockIn: null, clockOut: null }
  try {
    const stored = localStorage.getItem(TODAY_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.date === todayStr()) return parsed
    }
  } catch { /* ignore */ }
  return { clockIn: null, clockOut: null }
}

const AttendanceContext = createContext<AttendanceStore | null>(null)

export function AttendanceStoreProvider({ children }: { readonly children: React.ReactNode }) {
  const [entries, setEntries] = useState<readonly AttendanceEntry[]>(() => loadEntries())
  const [todayClockIn, setTodayClockIn] = useState<string | null>(() => loadToday().clockIn)
  const [todayClockOut, setTodayClockOut] = useState<string | null>(() => loadToday().clockOut)

  // localStorage に同期
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem(TODAY_KEY, JSON.stringify({
      date: todayStr(),
      clockIn: todayClockIn,
      clockOut: todayClockOut,
    }))
  }, [todayClockIn, todayClockOut])

  const todayStatus = todayClockOut ? 'finished' as const
    : todayClockIn ? 'working' as const
    : 'not_started' as const

  const clockIn = useCallback(() => {
    const now = new Date().toISOString()
    setTodayClockIn(now)
  }, [])

  const clockOut = useCallback(() => {
    const now = new Date().toISOString()
    setTodayClockOut(now)

    // カレンダー用のエントリーを追加
    if (todayClockIn) {
      const startMs = new Date(todayClockIn).getTime()
      const endMs = new Date(now).getTime()
      const workMinutes = Math.round((endMs - startMs) / 60000) - 60 // 休憩60分想定
      const workHours = Math.round((workMinutes / 60) * 10) / 10

      const entry: AttendanceEntry = {
        date: todayStr(),
        type: isLate(todayClockIn) ? 'late' : 'normal',
        clockIn: formatClockTime(todayClockIn),
        clockOut: formatClockTime(now),
        breakMin: 60,
        workHours: Math.max(workHours, 0),
      }

      setEntries(prev => {
        const filtered = prev.filter(e => e.date !== todayStr())
        return [entry, ...filtered]
      })
    }
  }, [todayClockIn])

  const reset = useCallback(() => {
    setTodayClockIn(null)
    setTodayClockOut(null)
    setEntries(prev => prev.filter(e => e.date !== todayStr()))
  }, [])

  const value: AttendanceStore = {
    entries,
    todayClockIn,
    todayClockOut,
    todayStatus,
    clockIn,
    clockOut,
    reset,
  }

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendanceStore(): AttendanceStore {
  const ctx = useContext(AttendanceContext)
  if (!ctx) {
    throw new Error('useAttendanceStore must be used within AttendanceStoreProvider')
  }
  return ctx
}
