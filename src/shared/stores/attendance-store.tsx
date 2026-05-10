'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

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
  readonly loading: boolean
}

interface AttendanceStoreActions {
  readonly clockIn: () => Promise<void>
  readonly clockOut: () => Promise<void>
  readonly reset: () => Promise<void>
}

type AttendanceStore = AttendanceStoreState & AttendanceStoreActions

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

const AttendanceContext = createContext<AttendanceStore | null>(null)

export function AttendanceStoreProvider({ children }: { readonly children: React.ReactNode }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<readonly AttendanceEntry[]>([])
  const [todayClockIn, setTodayClockIn] = useState<string | null>(null)
  const [todayClockOut, setTodayClockOut] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Supabaseからデータを取得
  useEffect(() => {
    if (!user) { setLoading(false); return }

    const fetchData = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (data) {
        const mapped: AttendanceEntry[] = data.map(row => {
          const clockInStr = row.clock_in ? formatClockTime(row.clock_in) : '-'
          const clockOutStr = row.clock_out ? formatClockTime(row.clock_out) : '-'
          let workHours = 0
          if (row.clock_in && row.clock_out) {
            const ms = new Date(row.clock_out).getTime() - new Date(row.clock_in).getTime()
            workHours = Math.round(((ms / 60000) - (row.break_minutes || 60)) / 60 * 10) / 10
            if (workHours < 0) workHours = 0
          }
          return {
            date: row.date,
            type: row.type || 'normal',
            clockIn: clockInStr,
            clockOut: clockOutStr,
            breakMin: row.break_minutes || 60,
            workHours,
          }
        })
        setEntries(mapped)

        // 今日のレコードがあれば状態を復元
        const todayRecord = data.find(r => r.date === todayStr())
        if (todayRecord) {
          setTodayClockIn(todayRecord.clock_in)
          setTodayClockOut(todayRecord.clock_out)
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [user])

  const todayStatus = todayClockOut ? 'finished' as const
    : todayClockIn ? 'working' as const
    : 'not_started' as const

  const clockIn = useCallback(async () => {
    if (!user) return
    const now = new Date().toISOString()
    setTodayClockIn(now)

    await supabase.from('attendances').upsert({
      user_id: user.id,
      date: todayStr(),
      clock_in: now,
      type: isLate(now) ? 'late' : 'normal',
    }, { onConflict: 'user_id,date' })
  }, [user])

  const clockOut = useCallback(async () => {
    if (!user || !todayClockIn) return
    const now = new Date().toISOString()
    setTodayClockOut(now)

    const startMs = new Date(todayClockIn).getTime()
    const endMs = new Date(now).getTime()
    const workMinutes = Math.round((endMs - startMs) / 60000) - 60
    const workHours = Math.max(Math.round((workMinutes / 60) * 10) / 10, 0)

    await supabase.from('attendances').update({
      clock_out: now,
    }).eq('user_id', user.id).eq('date', todayStr())

    // ローカル状態も更新
    const entry: AttendanceEntry = {
      date: todayStr(),
      type: isLate(todayClockIn) ? 'late' : 'normal',
      clockIn: formatClockTime(todayClockIn),
      clockOut: formatClockTime(now),
      breakMin: 60,
      workHours,
    }
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== todayStr())
      return [entry, ...filtered]
    })
  }, [user, todayClockIn])

  const reset = useCallback(async () => {
    if (!user) return
    setTodayClockIn(null)
    setTodayClockOut(null)

    await supabase.from('attendances').delete()
      .eq('user_id', user.id).eq('date', todayStr())

    setEntries(prev => prev.filter(e => e.date !== todayStr()))
  }, [user])

  const value: AttendanceStore = {
    entries, todayClockIn, todayClockOut, todayStatus, loading,
    clockIn, clockOut, reset,
  }

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendanceStore(): AttendanceStore {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendanceStore must be used within AttendanceStoreProvider')
  return ctx
}
