'use client'

import { AuthProvider, useAuthProvider } from '../hooks/use-auth'

interface AuthProviderWrapperProps {
  readonly children: React.ReactNode
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  const auth = useAuthProvider()
  return <AuthProvider value={auth}>{children}</AuthProvider>
}
