'use client'

import { useState } from 'react'

type ShiftStatus = 'pending' | 'approved' | 'rejected'
type ShiftType = 'normal' | 'early' | 'late' | 'night' | 'holiday'

interface ShiftRequest {
  readonly id: string
  readonly date: string
  readonly shiftType: ShiftType
  readonly startTime: string
  readonly endTime: string
  readonly reason: string
  readonly status: ShiftStatus
  readonly approver: string | null
  readonly comment: string | null
  readonly createdAt: string
}

const STATUS_CONFIG = {
  pending: {
    label: '申請中',
    color: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  approved: {
    label: '承認済',
    color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  rejected: {
    label: '却下',
    color: 'bg-red-50 text-red-700 border border-red-200',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
} as const

const SHIFT_TYPE_CONFIG = {
  normal: { label: '通常', color: 'bg-blue-50 text-blue-700' },
  early: { label: '早番', color: 'bg-cyan-50 text-cyan-700' },
  late: { label: '遅番', color: 'bg-purple-50 text-purple-700' },
  night: { label: '夜勤', color: 'bg-indigo-50 text-indigo-700' },
  holiday: { label: '休日出勤', color: 'bg-rose-50 text-rose-700' },
} as const

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdays[d.getDay()]})`
}

const INITIAL_REQUESTS: readonly ShiftRequest[] = [
  { id: '1', date: '2026-05-12', shiftType: 'normal', startTime: '09:00', endTime: '18:00', reason: '通常勤務', status: 'pending', approver: null, comment: null, createdAt: '2026-05-09T10:00:00' },
  { id: '2', date: '2026-05-13', shiftType: 'late', startTime: '13:00', endTime: '22:00', reason: '午前中に通院のため', status: 'pending', approver: null, comment: null, createdAt: '2026-05-09T10:05:00' },
  { id: '3', date: '2026-05-14', shiftType: 'early', startTime: '07:00', endTime: '16:00', reason: '子供の迎えのため早番希望', status: 'approved', approver: '佐藤 部長', comment: null, createdAt: '2026-05-08T09:00:00' },
  { id: '4', date: '2026-05-08', shiftType: 'normal', startTime: '09:00', endTime: '18:00', reason: '通常勤務', status: 'approved', approver: '佐藤 部長', comment: null, createdAt: '2026-05-06T14:00:00' },
  { id: '5', date: '2026-05-07', shiftType: 'night', startTime: '22:00', endTime: '07:00', reason: 'サーバーメンテナンス対応', status: 'rejected', approver: '佐藤 部長', comment: '人員超過のため別日程を検討してください', createdAt: '2026-05-05T11:00:00' },
]

export function ShiftRequestPage() {
  const [requests, setRequests] = useState<readonly ShiftRequest[]>(INITIAL_REQUESTS)
  const [date, setDate] = useState('')
  const [shiftType, setShiftType] = useState<ShiftType>('normal')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<ShiftStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!date) {
      setError('日付を選択してください')
      return
    }
    if (!startTime || !endTime) {
      setError('開始・終了時間を入力してください')
      return
    }
    if (shiftType !== 'night' && endTime <= startTime) {
      setError('終了時間は開始時間より後にしてください')
      return
    }

    const newRequest: ShiftRequest = {
      id: crypto.randomUUID(),
      date,
      shiftType,
      startTime,
      endTime,
      reason: reason || '通常勤務',
      status: 'pending',
      approver: null,
      comment: null,
      createdAt: new Date().toISOString(),
    }

    setRequests(prev => [newRequest, ...prev])
    setDate('')
    setShiftType('normal')
    setStartTime('09:00')
    setEndTime('18:00')
    setReason('')
    setShowForm(false)
  }

  const handleStatusChange = (id: string, status: ShiftStatus) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status, approver: '佐藤 部長' } : r))
    )
  }

  const handleDelete = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus)

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">シフト申請</h2>
          <p className="mt-1 text-sm text-gray-400">シフトの希望を提出・管理できます</p>
        </div>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新規申請
        </button>
      </div>

      {/* 統計カード */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <p className="text-[11px] font-medium tracking-wider text-amber-600">申請中</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}<span className="ml-1 text-sm font-normal">件</span></p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="text-[11px] font-medium tracking-wider text-emerald-600">承認済</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{approvedCount}<span className="ml-1 text-sm font-normal">件</span></p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
          <p className="text-[11px] font-medium tracking-wider text-red-600">却下</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{rejectedCount}<span className="ml-1 text-sm font-normal">件</span></p>
        </div>
      </div>

      {/* 新規申請フォーム */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-5 text-sm font-semibold text-gray-900">新規シフト申請</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">日付</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">シフト種別</label>
              <select
                value={shiftType}
                onChange={e => setShiftType(e.target.value as ShiftType)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {Object.entries(SHIFT_TYPE_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">開始時間</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">終了時間</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">備考・理由</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="例: 通院のため"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700"
            >
              申請する
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* フィルター */}
      <div className="mb-4 flex items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              filterStatus === status
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'すべて' : STATUS_CONFIG[status].label}
          </button>
        ))}
      </div>

      {/* 申請一覧 */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">該当する申請はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => {
            const statusCfg = STATUS_CONFIG[req.status]
            const typeCfg = SHIFT_TYPE_CONFIG[req.shiftType]
            return (
              <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* 日付 */}
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-gray-50">
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(req.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold leading-tight text-gray-900">
                        {new Date(req.date + 'T00:00:00').getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-gray-900">
                          {formatDate(req.date)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeCfg.color}`}>
                          {typeCfg.label}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[13px] text-gray-500">
                        {req.startTime} - {req.endTime}
                      </p>
                      {req.reason && (
                        <p className="mt-1 text-[12px] text-gray-400">{req.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${statusCfg.color}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* 却下コメント */}
                {req.comment && (
                  <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-[12px] text-red-700">
                    <span className="font-semibold">却下理由: </span>{req.comment}
                  </div>
                )}

                {/* 操作ボタン */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                  <div className="text-[11px] text-gray-400">
                    {req.approver && `承認者: ${req.approver}`}
                  </div>
                  <div className="flex gap-2">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req.id, 'approved')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-600"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          承認
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, 'rejected')}
                          className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-600"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          却下
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-200"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
