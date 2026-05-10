'use client'

import { useState, useCallback } from 'react'
import type { WorkStatus, TimelineRecord } from '../types'

interface PunchClockState {
  readonly status: WorkStatus
  readonly clockInTime: string | null
  readonly clockOutTime: string | null
  readonly timeline: readonly TimelineRecord[]
}

export function usePunchClock() {
  const [state, setState] = useState<PunchClockState>({
    status: 'not_started',
    clockInTime: null,
    clockOutTime: null,
    timeline: [],
  })

  const clockIn = useCallback(() => {
    const now = new Date().toISOString()
    setState(prev => ({
      ...prev,
      status: 'working',
      clockInTime: now,
      timeline: [...prev.timeline, { type: 'clock_in', time: now, label: '出勤' }],
    }))
  }, [])

  const clockOut = useCallback(() => {
    const now = new Date().toISOString()
    setState(prev => ({
      ...prev,
      status: 'finished',
      clockOutTime: now,
      timeline: [...prev.timeline, { type: 'clock_out', time: now, label: '退勤' }],
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      status: 'not_started',
      clockInTime: null,
      clockOutTime: null,
      timeline: [],
    })
  }, [])

  return { ...state, clockIn, clockOut, reset }
}
