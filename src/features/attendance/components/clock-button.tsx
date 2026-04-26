'use client'

import type { WorkStatus } from '../types'

interface ClockButtonProps {
  readonly status: WorkStatus
  readonly onClockIn: () => void
  readonly onClockOut: () => void
}

const STATUS_CONFIG = {
  not_started: {
    label: '出勤',
    bgClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    disabled: false,
    action: 'clock_in' as const,
  },
  working: {
    label: '退勤',
    bgClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    disabled: false,
    action: 'clock_out' as const,
  },
  finished: {
    label: '退勤済み',
    bgClass: 'bg-gray-400',
    disabled: true,
    action: null,
  },
} as const

export function ClockButton({ status, onClockIn, onClockOut }: ClockButtonProps) {
  const config = STATUS_CONFIG[status]

  const handleClick = () => {
    if (config.action === 'clock_in') {
      onClockIn()
    } else if (config.action === 'clock_out') {
      onClockOut()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={config.disabled}
      className={`h-40 w-40 rounded-full text-2xl font-bold text-white shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${config.bgClass}`}
    >
      {config.label}
    </button>
  )
}
