import type { Providers } from '../session/session.types'

export type TTL = number

export interface Store {
  host: string
  port: number
  password?: string
  tls?: boolean
}

export interface Session {
  store: Store
  ttl: TTL
  rolling: boolean
}

export interface Tokens {
  access: {
    ttl: TTL
  }
  refresh: {
    ttl: TTL
  }
}

export type ProvidersConfig = Record<Providers, { enabled: boolean }>

export interface RateLimit {
  enabled: boolean
  maxAttempts: number
  windowMs: number
}

export interface Security {
  rateLimit: RateLimit
  ipTracking: boolean
}

export interface Cookie {
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
