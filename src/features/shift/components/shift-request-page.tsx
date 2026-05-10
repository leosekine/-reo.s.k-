'use client'

import { useState } from 'react'

type ShiftStatus = 'pending' | 'approved' | 'rejected'

interface ShiftRequest {
  readonly id: string
  readonly date: string
  readonly startTime: string
  readonly endTime: string
  readonly status: ShiftStatus
}

const STATUS_CONFIG = {
  pending: { label: '申請中', color: 'bg-gray-100 text-gray-600' },
  approved: { label: '承認', color: 'bg-green-100 text-green-700' },
  rejected: { label: '却下', color: 'bg-red-100 text-red-700' },
} as const

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
}

const INITIAL_REQUESTS: readonly ShiftRequest[] = [
  { id: '1', date: '2026-05-12', startTime: '09:00', endTime: '18:00', status: 'pending' },
  { id: '2', date: '2026-05-13', startTime: '10:00', endTime: '19:00', status: 'pending' },
  { id: '3', date: '2026-05-14', startTime: '08:00', endTime: '17:00', status: 'approved' },
  { id: '4', date: '2026-05-08', startTime: '09:00', endTime: '18:00', status: 'approved' },
  { id: '5', date: '2026-05-07', startTime: '13:00', endTime: '22:00', status: 'rejected' },
]

export function ShiftRequestPage() {
  const [requests, setRequests] = useState<readonly ShiftRequest[]>(INITIAL_REQUESTS)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!date || !startTime || !endTime) {
      setError('すべての項目を入力してください')
      return
    }

    if (endTime <= startTime) {
      setError('終了時間は開始時間より後にしてください')
      return
    }

    const newRequest: ShiftRequest = {
      id: crypto.randomUUID(),
      date,
      startTime,
      endTime,
      status: 'pending',
    }

    setRequests(prev => [newRequest, ...prev])
    setDate('')
    setStartTime('')
    setEndTime('')
  }

  const handleStatusChange = (id: string, status: ShiftStatus) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    )
  }

  const handleDelete = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pt-10">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">シフト申請画面</h2>

      {/* 申請フォーム */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              開始時間
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              終了時間
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-blue-700"
          >
            申請
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </form>

      {/* 申請一覧 */}
      <h3 className="mb-4 text-lg font-semibold text-gray-900">申請一覧</h3>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-400">申請はまだありません</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-5 py-3">日付</th>
                <th className="px-5 py-3">時間帯</th>
                <th className="px-5 py-3">ステータス</th>
                <th className="px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map(req => (
                <tr key={req.id}>
                  <td className="px-5 py-4 text-gray-900">
                    {formatDate(req.date)}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {req.startTime} 〜 {req.endTime}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CONFIG[req.status].color}`}>
                      {STATUS_CONFIG[req.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(req.id, 'approved')}
                            className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-green-600"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleStatusChange(req.id, 'rejected')}
                            className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                          >
                            却下
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-300"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
