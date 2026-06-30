import Redis from 'ioredis'

import { AuthError, AuthErrorCode } from '../errors/auth.errors'

import type { Store } from '../types/config.types'

export interface RedisStoreClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
}

let client: Redis | null = null

export function getRedisClient(config: Store): Redis {
  if (client) return client

  client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    tls: config.tls ? {} : undefined,
    maxRetriesPerRequest: 3,
  })

  client.on('error', (err: Error) => {
    console.error('[dynauth] Redis connection error:', err.message)
  })

  client.on('connect', () => {
    console.warn('[dynauth] Redis connected')
  })

  client.on('reconnecting', () => {
    console.warn('[dynauth] Redis reconnecting...')
  })

  return client
}

export async function closeRedisClient(): Promise<void> {
  if (!client) return
  await client.quit()
  client = null
  console.warn('[dynauth] Redis connection closed')
}

export function createRedisStore(config: Store): RedisStoreClient {
  const redis = getRedisClient(config)

  return {
    async get(key: string): Promise<string | null> {
      try {
        return await redis.get(key)
      } catch (err) {
        console.error('[dynauth] Redis get failed:', err)
        throw new AuthError(AuthErrorCode.SESSION_STORE_UNAVAILABLE)
      }
    },

    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
      try {
        await redis.set(key, value, 'EX', ttlSeconds)
      } catch (err) {
        console.error('[dynauth] Redis set failed:', err)
        throw new AuthError(AuthErrorCode.SESSION_STORE_UNAVAILABLE)
      }
    },

    async delete(key: string): Promise<void> {
      try {
        await redis.del(key)
      } catch (err) {
        console.error('[dynauth] Redis delete failed:', err)
        throw new AuthError(AuthErrorCode.SESSION_STORE_UNAVAILABLE)
      }
    },
  }
}

export function _resetClientForTesting(): void {
  client = null
}

export type RedisStore = RedisStoreClient
