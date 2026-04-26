'use client'

import { useState, useEffect, useCallback } from 'react'
import { getToday } from '@/shared/utils/date'
import { buildTodayStatus, buildAttendanceRecord } from '../utils'
import { MOCK_ATTENDANCE_HISTORY } from '../mock-data'
import type { AttendanceRecord, TodayStatus } from '../types'

const STORAGE_KEY_PREFIX = 'attendance_today_'

interface StoredToday {
  readonly clockIn: string | null
  readonly clockOut: string | null
}

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}_${getToday()}`
}

export function useAttendance(userId: string) {
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({
    status: 'not_started',
    clockInTime: null,
    clockOutTime: null,
  })
  const [history, setHistory] = useState<readonly AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(userId))
      if (stored) {
        const parsed: StoredToday = JSON.parse(stored)
        setTodayStatus(buildTodayStatus(parsed.clockIn, parsed.clockOut))
      }
    } catch {
      // ignore parse errors
    }
    setHistory(MOCK_ATTENDANCE_HISTORY)
    setLoading(false)
  }, [userId])

  const clockIn = useCallback(() => {
    const now = new Date().toISOString()
    const updated: StoredToday = { clockIn: now, clockOut: null }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated))
    setTodayStatus(buildTodayStatus(now, null))
  }, [userId])

  const clockOut = useCallback(() => {
    const now = new Date().toISOString()
    const stored = localStorage.getItem(getStorageKey(userId))
    const parsed: StoredToday = stored
      ? JSON.parse(stored)
      : { clockIn: null, clockOut: null }
    const updated: StoredToday = { ...parsed, clockOut: now }
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated))
    setTodayStatus(buildTodayStatus(parsed.clockIn, now))

    if (parsed.clockIn) {
      const newRecord = buildAttendanceRecord(
        `today-${Date.now()}`,
        getToday(),
        parsed.clockIn,
        now,
      )
      setHistory(prev => [newRecord, ...prev])
    }
  }, [userId])

  return { todayStatus, history, loading, clockIn, clockOut }
}
