'use client'

import { useState } from 'react'

interface DailyReport {
  readonly id: string
  readonly date: string
  readonly content: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const INITIAL_REPORTS: readonly DailyReport[] = [
  {
    id: '1',
    date: '2026-04-24',
    content: 'ユーザー管理APIの設計レビューを実施。認証周りの仕様を確認し、修正方針を決定した。午後はフロントエンドのコンポーネント実装を進めた。',
  },
  {
    id: '2',
    date: '2026-04-23',
    content: 'データベースのマイグレーションスクリプトを作成。テスト環境で動作確認を行い、問題なく完了。チームの進捗ミーティングに参加。',
  },
  {
    id: '3',
    date: '2026-04-22',
    content: 'スプリント計画ミーティングに参加し、今週のタスクを確認。午後は打刻機能のバグ修正とユニットテストの追加を行った。',
  },
]

const MAX_CONTENT_LENGTH = 500

export function DailyReportPage() {
  const [reports, setReports] = useState<readonly DailyReport[]>(INITIAL_REPORTS)
  const [date, setDate] = useState(todayStr())
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [filterDate, setFilterDate] = useState('')

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
          r.id === editingId ? { ...r, date, content: content.trim() } : r
        )
      )
      setEditingId(null)
    } else {
      const newReport: DailyReport = {
        id: crypto.randomUUID(),
        date,
        content: content.trim(),
      }
      setReports(prev => [newReport, ...prev])
    }

    setDate(todayStr())
    setContent('')
  }

  const handleEdit = (report: DailyReport) => {
    setEditingId(report.id)
    setDate(report.date)
    setContent(report.content)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('この日報を削除しますか？')) return
    setReports(prev => prev.filter(r => r.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setDate(todayStr())
      setContent('')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setDate(todayStr())
    setContent('')
    setError('')
  }

  const filteredReports = filterDate
    ? reports.filter(r => r.date === filterDate)
    : reports

  const sorted = [...filteredReports].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-3xl px-6 pt-10">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">日報画面</h2>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          {editingId ? '日報を編集' : '日報を作成'}
        </h3>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            業務内容
            <span className="ml-2 text-xs text-gray-400">{content.length}/{MAX_CONTENT_LENGTH}</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            placeholder="今日の業務内容を入力してください"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-blue-700"
          >
            {editingId ? '更新' : '保存'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      {/* 一覧ヘッダー + フィルター */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">日報一覧</h3>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* 一覧 */}
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">日報はまだありません</p>
      ) : (
        <div className="space-y-4">
          {sorted.map(report => (
            <div
              key={report.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(report.date)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(report)}
                    className="rounded bg-yellow-400 px-3 py-1 text-xs font-medium text-yellow-900 transition-colors hover:bg-yellow-500"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {report.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
