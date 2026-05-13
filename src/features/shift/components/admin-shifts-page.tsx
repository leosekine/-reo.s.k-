'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

type ShiftStatus = 'pending' | 'approved' | 'rejected'
type ShiftType = 'normal' | 'early' | 'late' | 'night' | 'holiday'

interface AdminShift {
  readonly id: string
  readonly user_id: string
  readonly date: string
  readonly shift_type: ShiftType
  readonly start_time: string
  readonly end_time: string
  readonly reason: string
  readonly status: ShiftStatus
  readonly approver: string | null
  readonly comment: string | null
  readonly created_at: string
}

interface ProfileLite {
  readonly id: string
  readonly name: string
  readonly role: 'admin' | 'member'
  readonly department: string
}

const STATUS_CONFIG = {
  pending: { label: '申請中', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  approved: { label: '承認済', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected: { label: '却下', color: 'bg-red-50 text-red-700 border border-red-200' },
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

function trimTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t
}

export function AdminShiftsPage() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<readonly AdminShift[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({})
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<ShiftStatus | 'all'>('pending')
  const [actionError, setActionError] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [shiftsRes, profilesRes] = await Promise.all([
      supabase.from('shifts').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id,name,role,department'),
    ])
    if (shiftsRes.data) setShifts(shiftsRes.data as AdminShift[])
    if (profilesRes.data) {
      const map: Record<string, ProfileLite> = {}
      for (const p of profilesRes.data as ProfileLite[]) map[p.id] = p
      setProfiles(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const approverName = profiles[user?.id ?? '']?.name ?? '管理者'

  const handleApprove = async (id: string) => {
    setActionError('')
    setBusyId(id)
    setConfirmApproveId(null)
    const { error } = await supabase.from('shifts')
      .update({ status: 'approved', approver: approverName, comment: null })
      .eq('id', id)
    if (error) setActionError(error.message)
    else await fetchAll()
    setBusyId(null)
  }

  const handleReject = async (id: string) => {
    setActionError('')
    if (!rejectComment.trim()) {
      setActionError('却下理由を入力してください')
      return
    }
    setBusyId(id)
    const { error } = await supabase.from('shifts')
      .update({ status: 'rejected', approver: approverName, comment: rejectComment.trim() })
      .eq('id', id)
    if (error) setActionError(error.message)
    else {
      setRejectingId(null)
      setRejectComment('')
      await fetchAll()
    }
    setBusyId(null)
  }

  const filtered = filterStatus === 'all' ? shifts : shifts.filter(s => s.status === filterStatus)
  const pendingCount = shifts.filter(s => s.status === 'pending').length
  const approvedCount = shifts.filter(s => s.status === 'approved').length
  const rejectedCount = shifts.filter(s => s.status === 'rejected').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
            <h2 className="text-lg font-bold text-gray-900">シフト承認管理</h2>
          </div>
          <p className="text-[12px] text-gray-500">全メンバーのシフト申請を確認・承認/却下できます</p>
        </div>
      </div>

      {/* 統計 */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <button onClick={() => setFilterStatus('pending')}
          className={`rounded-xl border px-4 py-3 text-left transition-all ${
            filterStatus === 'pending' ? 'border-amber-300 bg-amber-50 shadow-sm' : 'border-amber-100 bg-amber-50/30 hover:bg-amber-50/60'
          }`}>
          <p className="text-[11px] font-medium text-amber-600">申請中（要対応）</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pendingCount}</p>
        </button>
        <button onClick={() => setFilterStatus('approved')}
          className={`rounded-xl border px-4 py-3 text-left transition-all ${
            filterStatus === 'approved' ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/60'
          }`}>
          <p className="text-[11px] font-medium text-emerald-600">承認済</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{approvedCount}</p>
        </button>
        <button onClick={() => setFilterStatus('rejected')}
          className={`rounded-xl border px-4 py-3 text-left transition-all ${
            filterStatus === 'rejected' ? 'border-red-300 bg-red-50 shadow-sm' : 'border-red-100 bg-red-50/30 hover:bg-red-50/60'
          }`}>
          <p className="text-[11px] font-medium text-red-600">却下</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{rejectedCount}</p>
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                filterStatus === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {s === 'all' ? 'すべて' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <button onClick={fetchAll} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          再読込
        </button>
      </div>

      {actionError && (
        <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-700">{actionError}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
          <p className="mt-3 text-sm text-gray-400">読込中…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">該当する申請はありません</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(req => {
            const statusCfg = STATUS_CONFIG[req.status]
            const typeCfg = SHIFT_TYPE_CONFIG[req.shift_type]
            const profile = profiles[req.user_id]
            const memberName = profile?.name || '不明なユーザー'
            const isRejecting = rejectingId === req.id
            const isBusy = busyId === req.id

            return (
              <div key={req.id} className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-gray-50">
                      <span className="text-[9px] font-medium text-gray-400">
                        {new Date(req.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short' })}
                      </span>
                      <span className="text-base font-bold leading-tight text-gray-900">
                        {new Date(req.date + 'T00:00:00').getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-gray-900">{memberName}</span>
                        {profile?.department && <span className="text-[11px] text-gray-400">{profile.department}</span>}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeCfg.color}`}>
                          {typeCfg.label}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className="text-[12px] text-gray-600">{formatDate(req.date)}</span>
                        <span className="font-mono text-[12px] text-gray-500">{trimTime(req.start_time)} - {trimTime(req.end_time)}</span>
                        {req.reason && <span className="text-[11px] text-gray-400">{req.reason}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {req.comment && (
                  <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    <span className="font-semibold">却下理由:</span> {req.comment}
                  </div>
                )}

                {/* 承認/却下操作 - pending のみ */}
                {req.status === 'pending' && !isRejecting && (
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-50 pt-2.5">
                    <button onClick={() => { setRejectingId(req.id); setRejectComment(''); setActionError('') }}
                      disabled={isBusy}
                      className="rounded-md bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-600 disabled:bg-gray-300">
                      却下
                    </button>
                    <button onClick={() => { setConfirmApproveId(req.id); setActionError('') }}
                      disabled={isBusy}
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-gray-300">
                      {isBusy ? '処理中…' : '承認'}
                    </button>
                  </div>
                )}

                {/* 却下コメント入力 */}
                {req.status === 'pending' && isRejecting && (
                  <div className="mt-3 space-y-2 border-t border-gray-50 pt-3">
                    <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} rows={2}
                      placeholder="却下理由を入力してください"
                      className="w-full rounded-lg border border-red-200 bg-red-50/30 px-3 py-2 text-[12px] focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setRejectingId(null); setRejectComment(''); setActionError('') }}
                        className="rounded-md bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-200">
                        キャンセル
                      </button>
                      <button onClick={() => handleReject(req.id)}
                        disabled={isBusy}
                        className="rounded-md bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600 disabled:bg-gray-300">
                        {isBusy ? '送信中…' : '却下する'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 確定後表示 */}
                {req.status !== 'pending' && (
                  <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2.5">
                    <span className="text-[11px] text-gray-400">
                      {req.approver ? `承認者: ${req.approver}` : ''}
                    </span>
                    <span className="text-[11px] text-gray-400">確定済（変更不可）</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 承認確認ダイアログ */}
      {confirmApproveId && (() => {
        const target = shifts.find(s => s.id === confirmApproveId)
        if (!target) return null
        const profile = profiles[target.user_id]
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">本当に承認しますか?</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                    一度承認すると取り消せません。
                  </p>
                </div>
              </div>

              <div className="mb-5 space-y-1.5 rounded-lg border border-gray-100 bg-gray-50 p-3 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">申請者</span>
                  <span className="font-medium text-gray-900">{profile?.name ?? '不明'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">日付</span>
                  <span className="font-medium text-gray-900">{formatDate(target.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">時間</span>
                  <span className="font-mono font-medium text-gray-900">{trimTime(target.start_time)} - {trimTime(target.end_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">種別</span>
                  <span className="font-medium text-gray-900">{SHIFT_TYPE_CONFIG[target.shift_type].label}</span>
                </div>
                {target.reason && (
                  <div className="border-t border-gray-200 pt-1.5">
                    <span className="text-gray-500">理由: </span>
                    <span className="text-gray-700">{target.reason}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setConfirmApproveId(null)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  キャンセル
                </button>
                <button onClick={() => handleApprove(confirmApproveId)}
                  disabled={busyId === confirmApproveId}
                  className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:bg-gray-300">
                  {busyId === confirmApproveId ? '処理中…' : '承認する'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
