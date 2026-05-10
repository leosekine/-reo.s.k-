interface TodaySummaryProps {
  readonly clockInTime: string | null
  readonly clockOutTime: string | null
}

function formatRecordTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function calcWorkTime(clockIn: string, clockOut: string | null): string {
  const start = new Date(clockIn).getTime()
  const end = clockOut ? new Date(clockOut).getTime() : Date.now()
  const minutes = Math.round((end - start) / 60000)
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
}

export function TodaySummary({ clockInTime, clockOutTime }: TodaySummaryProps) {
  if (!clockInTime) return null

  return (
    <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
      <div className="px-6 py-5 text-center">
        <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">出勤時刻</p>
        <p className="text-xl font-bold text-gray-900">{formatRecordTime(clockInTime)}</p>
      </div>
      <div className="px-6 py-5 text-center">
        <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">退勤時刻</p>
        <p className="text-xl font-bold text-gray-900">
          {clockOutTime ? formatRecordTime(clockOutTime) : '--:--'}
        </p>
      </div>
      <div className="px-6 py-5 text-center">
        <p className="mb-1 text-[11px] font-medium tracking-wider text-gray-400">実働時間</p>
        <p className="text-xl font-bold text-blue-600">{calcWorkTime(clockInTime, clockOutTime)}</p>
      </div>
    </div>
  )
}
