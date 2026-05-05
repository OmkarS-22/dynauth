import type { Providers } from '../session/session.types'

type TTL = number

interface Session {
  store: unknown
  ttl: TTL
  rolling: boolean
}

interface Tokens {
  access: {
    ttl: TTL
  }
  refresh: {
    ttl: TTL
  }
}

type ProvidersConfig = Record<Providers, { enabled: boolean }>

interface RateLimit {
  enabled: boolean
  maxAttempts: number
  windowMs: number
}

interface Security {
  rateLimit: RateLimit
  ipTracking: boolean
}

interface Cookie {
  name: string
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  domain?: string
}

export interface ServerConfig {
  session: Session
  tokens: Tokens
  providers: ProvidersConfig
  security: Security
  cookie: Cookie
}
