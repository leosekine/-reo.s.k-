export const WORK_RULES = {
  startHour: 9,
  startMinute: 0,
  endHour: 18,
  endMinute: 0,
  breakMinutes: 60,
  lateThresholdMinutes: 5,
  overtimeMonthlyLimitHours: 45,
} as const

export const APP_NAME = '勤怠管理'

export const NAV_ITEMS = [
  { href: '/attendance', label: '打刻', icon: 'clock', roles: ['member', 'admin'] },
  { href: '/shift-request', label: 'シフト申請', icon: 'calendar-plus', roles: ['member', 'admin'] },
  { href: '/shift-manage', label: 'シフト管理', icon: 'settings', roles: ['admin'] },
  { href: '/calendar', label: 'カレンダー', icon: 'calendar', roles: ['member', 'admin'] },
  { href: '/dashboard', label: 'ダッシュボード', icon: 'bar-chart', roles: ['admin'] },
  { href: '/daily-report', label: '日報', icon: 'file-text', roles: ['member', 'admin'] },
  { href: '/staff', label: 'スタッフ管理', icon: 'users', roles: ['admin'] },
  { href: '/settings', label: '設定', icon: 'cog', roles: ['admin'] },
] as const
