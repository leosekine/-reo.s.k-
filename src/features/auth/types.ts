import type { Profile } from '@/shared/types/database'

export interface AuthState {
  readonly user: Profile | null
  readonly loading: boolean
}

export interface AuthActions {
  readonly login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  readonly logout: () => void
}

export type AuthContext = AuthState & AuthActions
