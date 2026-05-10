import { STATUS_CONFIG } from '../types'
import type { WorkStatus } from '../types'

interface StatusBadgeProps {
  readonly status: WorkStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className={`flex items-center gap-2 rounded-full border px-5 py-2 ${config.bgColor} ${config.borderColor}`}>
      <span className={`h-2 w-2 rounded-full ${config.dotColor} ${
        status === 'working' ? 'animate-pulse' : ''
      }`} />
      <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
    </div>
  )
}
