'use client'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { AuthGuard } from '@/features/auth/components/auth-guard'
import { AppShell } from '@/shared/components/layout/app-shell'
import { useAttendance } from '@/features/attendance/hooks/use-attendance'
import { useCurrentTime } from '@/shared/hooks/use-current-time'
import { ClockButton } from '@/features/attendance/components/clock-button'
import { AttendanceStatus } from '@/features/attendance/components/attendance-status'
import { AttendanceHistory } from '@/features/attendance/components/attendance-history'
import { Card } from '@/shared/components/ui/card'
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner'
import { formatTime, formatDate } from '@/shared/utils/date'

function AttendanceContent() {
  const { user, logout } = useAuth()
  const now = useCurrentTime()
  const { todayStatus, history, loading, clockIn, clockOut } = useAttendance(user!.id)

  if (loading) {
    return (
      <AppShell user={user!} onLogout={logout}>
        <LoadingSpinner size="lg" className="mt-20" />
      </AppShell>
    )
  }

  return (
    <AppShell user={user!} onLogout={logout}>
      <div className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-xl font-bold text-gray-900">打刻</h2>

        <Card className="flex flex-col items-center py-10">
          <p className="mb-2 text-sm text-gray-500">{formatDate(now)}</p>
          <p className="mb-8 text-5xl font-bold tabular-nums text-gray-900">
            {formatTime(now)}
          </p>
          <ClockButton
            status={todayStatus.status}
            onClockIn={clockIn}
            onClockOut={clockOut}
          />
        </Card>

        <AttendanceStatus todayStatus={todayStatus} />
        <AttendanceHistory records={history} />
      </div>
    </AppShell>
  )
}

export default function AttendancePage() {
  return (
    <AuthGuard>
      <AttendanceContent />
    </AuthGuard>
  )
}
