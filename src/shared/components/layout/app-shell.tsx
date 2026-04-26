'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import type { Profile } from '@/shared/types/database'

interface AppShellProps {
  readonly user: Profile
  readonly onLogout: () => void
  readonly children: React.ReactNode
}

export function AppShell({ user, onLogout, children }: AppShellProps) {
  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
