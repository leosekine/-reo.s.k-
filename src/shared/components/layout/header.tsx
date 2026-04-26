'use client'

import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import type { Profile } from '@/shared/types/database'

interface HeaderProps {
  readonly user: Profile
  readonly onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {user.department}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
          <Badge variant={user.role === 'admin' ? 'info' : 'neutral'}>
            {user.role === 'admin' ? '管理者' : 'メンバー'}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          ログアウト
        </Button>
      </div>
    </header>
  )
}
