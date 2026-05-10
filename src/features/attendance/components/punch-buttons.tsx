import type { WorkStatus } from '../types'

interface PunchButtonsProps {
  readonly status: WorkStatus
  readonly onClockIn: () => void
  readonly onClockOut: () => void
  readonly onReset: () => void
}

export function PunchButtons({ status, onClockIn, onClockOut, onReset }: PunchButtonsProps) {
  return (
    <div className="flex items-center gap-4">
      {status === 'not_started' && (
        <button
          onClick={onClockIn}
          className="w-full rounded-2xl bg-emerald-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 active:scale-[0.98] sm:w-auto sm:px-16"
        >
          出勤する
        </button>
      )}

      {status === 'working' && (
        <button
          onClick={onClockOut}
          className="w-full rounded-2xl bg-red-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-red-500/40 active:scale-[0.98] sm:w-auto sm:px-16"
        >
          退勤する
        </button>
      )}

      {status === 'finished' && (
        <div className="text-center">
          <p className="mb-3 text-lg font-semibold text-gray-500">本日の勤務は終了しました</p>
          <button
            onClick={onReset}
            className="text-sm text-gray-400 underline decoration-dashed underline-offset-4 hover:text-gray-600"
          >
            リセット（デモ用）
          </button>
        </div>
      )}
    </div>
  )
}
