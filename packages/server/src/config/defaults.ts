import type { ServerConfig } from '../types/config.types'

export const defaultConfig: ServerConfig = {
  session: {
    store: {
      host: 'localhost',
      port: 6379,
    },
    ttl: 60 * 60 * 24 * 7, // 7 days
    rolling: true,
  },
  tokens: {
    access: {
      ttl: 60 * 15, // 15 minutes
    },
    refresh: {
      ttl: 60 * 60 * 24 * 30, // 30 days
    },
  },
  providers: {
    password: { enabled: true },
    google: { enabled: false },
    github: { enabled: false },
  },
  security: {
    rateLimit: {
      enabled: true,
      maxAttempts: 5,
      windowMs: 60 * 1000 * 15, // 15 minutes
    },
    ipTracking: true,
  },
  cookie: {
    name: 'dynauth.sid',
    secure: true,
    sameSite: 'lax',
  },
}
