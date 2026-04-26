'use client'

import { NAV_ITEMS, APP_NAME } from '@/shared/constants/config'
import { NavLink } from '@/shared/components/navigation/nav-link'
import type { Role } from '@/shared/types/database'

interface SidebarProps {
  readonly role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter(item =>
    (item.roles as readonly string[]).includes(role)
  )

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-lg font-bold text-gray-900">{APP_NAME}</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map(item => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </nav>
    </aside>
  )
}
