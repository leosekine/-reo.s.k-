import type { Profile } from '@/shared/types/database'

interface MockUser {
  readonly profile: Profile
  readonly password: string
}

export const MOCK_USERS: readonly MockUser[] = [
  {
    profile: {
      id: '1',
      email: 'admin@example.com',
      name: '田中 太郎',
      role: 'admin',
      department: '開発部',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    password: 'password123',
  },
  {
    profile: {
      id: '2',
      email: 'member@example.com',
      name: '佐藤 花子',
      role: 'member',
      department: '開発部',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    password: 'password123',
  },
]

export function findMockUser(email: string, password: string): Profile | null {
  const found = MOCK_USERS.find(
    u => u.profile.email === email && u.password === password
  )
  return found?.profile ?? null
}
