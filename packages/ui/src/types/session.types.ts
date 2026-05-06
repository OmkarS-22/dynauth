export type AuthFormStatus = 'idle' | 'submitting' | 'success' | 'error'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface User {
  id: string
  email: string
  metadata?: Record<string, unknown>
}
