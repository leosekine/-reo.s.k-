'use client'

import { useState, useEffect } from 'react'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDateJP(date: Date): string {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

export function CurrentClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-4">
      <p className="font-mono text-3xl font-bold tabular-nums text-gray-900">
        {formatTime(now)}
      </p>
      <p className="text-[13px] text-gray-400">{formatDateJP(now)}</p>
    </div>
  )
}
