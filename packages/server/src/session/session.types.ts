type AuthMethod = 'password' | 'google' | 'github' | 'saml'

type Provider = 'google' | 'github'

export interface SessionRecord {
  sessionId: string
  userId: string
  createdAt: Date
  expiresAt: Date

  authMethod: AuthMethod

  accessToken: string | null
  accessTokenExpiresAt: Date | null
  refreshToken: string | null
  refreshTokenExpiresAt: Date | null
  provider: Provider | null

  userAgent?: string
  ipAddress?: string
  lastActiveAt: Date
}
