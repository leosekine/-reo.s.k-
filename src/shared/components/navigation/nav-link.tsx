'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  readonly href: string
  readonly label: string
  readonly icon: string
}

const ICONS: Record<string, string> = {
  'clock': '🕐',
  'calendar-plus': '📋',
  'settings': '⚙️',
  'calendar': '📅',
  'bar-chart': '📊',
  'file-text': '📝',
  'users': '👥',
  'cog': '🔧',
}

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <span className="text-base">{ICONS[icon] || '📄'}</span>
      {label}
    </Link>
  )
}
