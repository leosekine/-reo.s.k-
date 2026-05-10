import type { TimelineRecord } from '../types'

interface PunchTimelineProps {
  readonly records: readonly TimelineRecord[]
}

function formatRecordTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export function PunchTimeline({ records }: PunchTimelineProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">本日のタイムライン</h3>
      </div>
      <div className="p-5">
        {records.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-gray-400">まだ打刻がありません</p>
        ) : (
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
            {records.map((record, i) => {
              const dotColor = record.type === 'clock_in' ? 'bg-emerald-500' : 'bg-red-500'
              return (
                <div key={i} className="relative flex items-center gap-3">
                  <span className={`absolute -left-6 h-3.5 w-3.5 rounded-full border-2 border-white ${dotColor} shadow-sm`} />
                  <div>
                    <p className="text-[13px] font-medium text-gray-900">{record.label}</p>
                    <p className="font-mono text-[11px] text-gray-400">{formatRecordTime(record.time)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
