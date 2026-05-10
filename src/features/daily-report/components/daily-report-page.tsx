'use client'

import { useState } from 'react'

interface DailyReport {
  readonly id: string
  readonly date: string
  readonly title: string
  readonly content: string
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}(${weekdays[d.getDay()]})`
}

const INITIAL_REPORTS: readonly DailyReport[] = [
  {
    id: '1',
    date: '2026-05-09',
    title: 'API設計レビュー・フロントエンド実装',
    content: 'ユーザー管理APIの設計レビューを実施。認証周りの仕様を確認し、修正方針を決定した。午後はフロントエンドのコンポーネント実装を進めた。',
  },
  {
    id: '2',
    date: '2026-05-08',
    title: 'DBマイグレーション・進捗ミーティング',
    content: 'データベースのマイグレーションスクリプトを作成。テスト環境で動作確認を行い、問題なく完了。チームの進捗ミーティングに参加。',
  },
  {
    id: '3',
    date: '2026-05-07',
    title: 'スプリント計画・バグ修正',
    content: 'スプリント計画ミーティングに参加し、今週のタスクを確認。午後は打刻機能のバグ修正とユニットテストの追加を行った。',
  },
  {
    id: '4',
    date: '2026-05-06',
    title: 'CI/CDパイプライン改善',
    content: 'CI/CDパイプラインの改善を行った。ビルド時間が20%短縮。新しいデプロイフローのドキュメントを作成中。',
  },
  {
    id: '5',
    date: '2026-05-05',
    title: 'コードレビュー・テスト追加',
    content: 'チームメンバーのPRをレビュー。認証モジュールのテストカバレッジを70%から85%に改善。',
  },
]

export function DailyReportPage() {
  const [reports, setReports] = useState<readonly DailyReport[]>(INITIAL_REPORTS)

  // フォーム状態
  const [formDate, setFormDate] = useState(todayStr())
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [error, setError] = useState('')

  // 編集モード
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...reports].sort((a, b) => b.date.localeCompare(a.date))

  // 同じ日付の日報が既にあるかチェック
  const hasDuplicate = (date: string, excludeId?: string): boolean =>
    reports.some(r => r.date === date && r.id !== excludeId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formDate) { setError('日付を選択してください'); return }
    if (!formTitle.trim()) { setError('タイトルを入力してください'); return }
    if (!formContent.trim()) { setError('業務内容を入力してください'); return }

    if (editingId) {
      // 編集
      if (hasDuplicate(formDate, editingId)) { setError('その日付の日報は既に存在します'); return }
      setReports(prev =>
        prev.map(r => r.id === editingId
          ? { ...r, date: formDate, title: formTitle.trim(), content: formContent.trim() }
          : r
        )
      )
      setEditingId(null)
    } else {
      // 新規作成
      if (hasDuplicate(formDate)) { setError('その日付の日報は既に存在します'); return }
      const newReport: DailyReport = {
        id: crypto.randomUUID(),
        date: formDate,
        title: formTitle.trim(),
        content: formContent.trim(),
      }
      setReports(prev => [newReport, ...prev])
    }

    resetForm()
  }

  const startEdit = (report: DailyReport) => {
    setEditingId(report.id)
    setFormDate(report.date)
    setFormTitle(report.title)
    setFormContent(report.content)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id))
    if (editingId === id) cancelEdit()
  }

  const resetForm = () => {
    setFormDate(todayStr())
    setFormTitle('')
    setFormContent('')
    setError('')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左: 作成/編集フォーム */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {editingId ? '日報を編集' : '日報を作成'}
              </h3>
              <p className="mt-0.5 text-[11px] text-gray-400">1日1レコード</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-gray-600">日付</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-gray-600">タイトル</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="例: API設計レビュー・実装作業"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-gray-600">
                  業務内容
                </label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  rows={5}
                  placeholder={"・実施した作業\n・成果・進捗\n・課題・気づき"}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-relaxed transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {editingId ? '更新する' : '作成する'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* 件数表示 */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500">登録件数</span>
              <span className="text-lg font-bold text-gray-900">{reports.length}<span className="ml-0.5 text-sm font-normal text-gray-400">件</span></span>
            </div>
          </div>
        </div>

        {/* 右: 一覧（2カラム） */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">日報一覧</h3>
            <span className="text-[11px] text-gray-400">日付の新しい順</span>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
              <svg className="mx-auto mb-3 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-sm text-gray-400">日報はまだありません</p>
              <p className="mt-1 text-[11px] text-gray-300">左のフォームから作成してください</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sorted.map(report => {
                const isEditing = editingId === report.id
                return (
                  <div
                    key={report.id}
                    className={`rounded-xl border bg-white shadow-sm transition-all ${
                      isEditing ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* 日付アイコン */}
                        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-gray-50">
                          <span className="text-[9px] font-medium text-gray-400">
                            {new Date(report.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'short' })}
                          </span>
                          <span className="text-sm font-bold leading-tight text-gray-900">
                            {new Date(report.date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{report.title}</p>
                          <p className="text-[11px] text-gray-400">{formatDate(report.date)}</p>
                        </div>
                      </div>

                      {/* 操作ボタン */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(report)}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            isEditing
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {isEditing ? '編集中' : '編集'}
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-50"
                        >
                          削除
                        </button>
                      </div>
                    </div>

                    {/* 本文 */}
                    <div className="px-5 py-3.5">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">
                        {report.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
