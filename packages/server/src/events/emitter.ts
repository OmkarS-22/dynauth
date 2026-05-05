import type { User } from '../adapters/db.adapter'

export interface EventPayloads {
  'login.success': { user: User; sessionId: string; ipAddress?: string }
  'login.failed': { email: string; reason: string; ipAddress?: string }
  logout: { sessionId: string; userId: string }
  'register.success': { user: User; sessionId: string; ipAddress?: string }
  'register.failed': { email: string; reason: string; ipAddress?: string }
  'session.expired': { sessionId: string; userId: string }
  'session.invalid': { sessionId: string }
  'ratelimit.triggered': {
    ipAddress: string
    endpoint: string
    attempts: number
  }
}
