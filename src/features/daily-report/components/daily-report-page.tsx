'use client'

import { useState } from 'react'

type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

interface DailyReport {
  readonly id: string
  readonly date: string
  readonly content: string
  readonly tasks: readonly string[]
  readonly mood: 'good' | 'normal' | 'bad'
  readonly status: ReportStatus
  readonly workHours: number
  readonly comment: string | null
}

const STATUS_CONFIG = {
  draft: { label: '下書き', color: 'bg-gray-50 text-gray-500 border border-gray-200' },
  submitted: { label: '提出済', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  approved: { label: '承認済', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  rejected: { label: '差戻し', color: 'bg-red-50 text-red-700 border border-red-200' },
} as const

const MOOD_CONFIG = {
  good: { label: '好調', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: '(^-^)' },
  normal: { label: '普通', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '(-_-)' },
  bad: { label: '不調', color: 'bg-red-50 text-red-600 border-red-200', icon: '(>_<)' },
} as const

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日(${weekdays[d.getDay()]})`
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const INITIAL_REPORTS: readonly DailyReport[] = [
  {
    id: '1',
    date: '2026-05-09',
    content: 'ユーザー管理APIの設計レビューを実施。認証周りの仕様を確認し、修正方針を決定した。午後はフロントエンドのコンポーネント実装を進めた。',
    tasks: ['API設計レビュー', 'コンポーネント実装', 'コードレビュー'],
    mood: 'good',
    status: 'approved',
    workHours: 8.5,
    comment: null,
  },
  {
    id: '2',
    date: '2026-05-08',
    content: 'データベースのマイグレーションスクリプトを作成。テスト環境で動作確認を行い、問題なく完了。チームの進捗ミーティングに参加。',
    tasks: ['DBマイグレーション', '動作確認テスト', '進捗ミーティング'],
    mood: 'normal',
    status: 'approved',
    workHours: 8.0,
    comment: null,
  },
  {
    id: '3',
    date: '2026-05-07',
    content: 'スプリント計画ミーティングに参加し、今週のタスクを確認。午後は打刻機能のバグ修正とユニットテストの追加を行った。',
    tasks: ['スプリント計画', 'バグ修正', 'テスト追加'],
    mood: 'normal',
    status: 'submitted',
    workHours: 8.2,
    comment: null,
  },
  {
    id: '4',
    date: '2026-05-06',
    content: 'CI/CDパイプラインの改善を行った。ビルド時間が20%短縮。新しいデプロイフローのドキュメントを作成中。',
    tasks: ['CI/CD改善', 'ドキュメント作成'],
    mood: 'good',
    status: 'rejected',
    workHours: 7.5,
    comment: '作業内容をより詳細に記載してください',
  },
]

const MAX_CONTENT_LENGTH = 500

export function DailyReportPage() {
  const [reports, setReports] = useState<readonly DailyReport[]>(INITIAL_REPORTS)
  const [date, setDate] = useState(todayStr())
  const [content, setContent] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [tasks, setTasks] = useState<readonly string[]>([])
  const [mood, setMood] = useState<'good' | 'normal' | 'bad'>('normal')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)

  const addTask = () => {
    if (taskInput.trim()) {
      setTasks(prev => [...prev, taskInput.trim()])
      setTaskInput('')
    }
  }

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!date) {
      setError('日付を入力してください')
      return
    }
    if (!content.trim()) {
      setError('業務内容を入力してください')
      return
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`業務内容は${MAX_CONTENT_LENGTH}文字以内で入力してください`)
      return
    }

    if (editingId) {
      setReports(prev =>
        prev.map(r =>
          r.id === editingId ? { ...r, date, content: content.trim(), tasks, mood, status: 'submitted' as ReportStatus } : r
        )
      )
      setEditingId(null)
    } else {
      const newReport: DailyReport = {
        id: crypto.randomUUID(),
        date,
        content: content.trim(),
        tasks,
        mood,
        status: 'submitted',
        workHours: 8.0,
        comment: null,
      }
      setReports(prev => [newReport, ...prev])
    }

    resetForm()
  }

  const resetForm = () => {
    setDate(todayStr())
    setContent('')
    setTasks([])
    setTaskInput('')
    setMood('normal')
    setError('')
    setShowForm(false)
  }

  const handleEdit = (report: DailyReport) => {
    setEditingId(report.id)
    setDate(report.date)
    setContent(report.content)
    setTasks(report.tasks)
    setMood(report.mood)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
    if (editingId === id) {
      setEditingId(null)
      resetForm()
    }
  }

  const handleApprove = (id: string) => {
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'approved' as ReportStatus } : r))
    )
  }

  const filteredReports = filterStatus === 'all'
    ? reports
    : reports.filter(r => r.status === filterStatus)

  const sorted = [...filteredReports].sort((a, b) => b.date.localeCompare(a.date))

  const submittedCount = reports.filter(r => r.status === 'submitted').length
  const approvedCount = reports.filter(r => r.status === 'approved').length

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">日報管理</h2>
          <p className="mt-1 text-sm text-gray-400">日々の業務内容を記録・管理できます</p>
        </div>
        <button
          onClick={() => { setShowForm(prev => !prev); setEditingId(null) }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          日報を書く
        </button>
      </div>

      {/* 統計 */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium text-gray-400">今月の日報</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{reports.length}<span className="ml-0.5 text-sm font-normal text-gray-400">件</span></p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium text-gray-400">提出済み</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{submittedCount}<span className="ml-0.5 text-sm font-normal text-gray-400">件</span></p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium text-gray-400">承認済み</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{approvedCount}<span className="ml-0.5 text-sm font-normal text-gray-400">件</span></p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium text-gray-400">平均勤務時間</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {reports.length > 0 ? (reports.reduce((sum, r) => sum + r.workHours, 0) / reports.length).toFixed(1) : '0.0'}
            <span className="ml-0.5 text-sm font-normal text-gray-400">h</span>
          </p>
        </div>
      </div>

      {/* 入力フォーム */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-5 text-sm font-semibold text-gray-900">
            {editingId ? '日報を編集' : '日報を作成'}
          </h3>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">コンディション</label>
              <div className="flex gap-2">
                {(Object.entries(MOOD_CONFIG) as [keyof typeof MOOD_CONFIG, typeof MOOD_CONFIG[keyof typeof MOOD_CONFIG]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(key)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-center text-[12px] font-medium transition-all ${
                      mood === key
                        ? `${cfg.color} border-current`
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-sm">{cfg.icon}</span>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-gray-600">タスク</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask() } }}
                  placeholder="タスク名を入力"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={addTask}
                  className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  追加
                </button>
              </div>
              {tasks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tasks.map((task, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                      {task}
                      <button type="button" onClick={() => removeTask(i)} className="ml-0.5 text-blue-400 hover:text-blue-600">x</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-gray-600">
              <span>業務内容</span>
              <span className={`${content.length > MAX_CONTENT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="今日の業務内容を入力してください&#10;・実施した作業&#10;・成果・進捗&#10;・課題・気づき"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-relaxed transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700"
            >
              {editingId ? '更新する' : '提出する'}
            </button>
            <button
              type="button"
              onClick={() => { setEditingId(null); resetForm() }}
              className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {/* フィルター */}
      <div className="mb-4 flex items-center gap-2">
        {(['all', 'submitted', 'approved', 'rejected', 'draft'] as const).map(status => (
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

      {/* 一覧 */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">該当する日報はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(report => {
            const statusCfg = STATUS_CONFIG[report.status]
            const moodCfg = MOOD_CONFIG[report.mood]
            return (
              <div key={report.id} className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                {/* ヘッダー */}
                <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-gray-50">
                      <span className="text-[10px] font-medium text-gray-400">{formatDateShort(report.date).split('/')[0]}月</span>
                      <span className="text-sm font-bold leading-tight text-gray-900">{formatDateShort(report.date).split('/')[1]}</span>
                    </div>
                    <div>
                      <span className="text-[13px] font-semibold text-gray-900">{formatDate(report.date)}</span>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">勤務時間: {report.workHours}h</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${moodCfg.color}`}>
                          {moodCfg.icon} {moodCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* 本文 */}
                <div className="px-5 py-4">
                  {report.tasks.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {report.tasks.map((task, i) => (
                        <span key={i} className="rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {task}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
                    {report.content}
                  </p>
                </div>

                {/* 却下コメント */}
                {report.comment && (
                  <div className="mx-5 mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-[12px] text-red-700">
                    <span className="font-semibold">コメント: </span>{report.comment}
                  </div>
                )}

                {/* フッター */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-50 px-5 py-3">
                  {report.status === 'submitted' && (
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-600"
                    >
                      承認
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(report)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
