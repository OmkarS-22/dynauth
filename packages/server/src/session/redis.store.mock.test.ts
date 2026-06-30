import { vi, describe, it, expect, afterEach } from 'vitest'

import { AuthError, AuthErrorCode } from '../errors/auth.errors'

import { createRedisStore, _resetClientForTesting } from './redis.store'
import * as redisStore from './redis.store'

import type Redis from 'ioredis'

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}

vi.spyOn(redisStore, 'getRedisClient').mockReturnValue(
  mockRedis as unknown as Redis,
)

describe('createRedisStore', () => {
  afterEach(() => {
    vi.clearAllMocks()
    _resetClientForTesting()
  })

  describe('get', () => {
    it('returns the value from Redis', async () => {
      mockRedis.get.mockResolvedValue('pong')
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      const result = await store.get('test:ping')
      expect(result).toBe('pong')
      expect(mockRedis.get).toHaveBeenCalledWith('test:ping')
    })

    it('returns null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null)
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      const result = await store.get('test:missing')
      expect(result).toBeNull()
    })

    it('throws SESSION_STORE_UNAVAILABLE when Redis fails', async () => {
      mockRedis.get.mockRejectedValue(new Error('connection lost'))
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      await expect(store.get('test:ping')).rejects.toThrow(AuthError)
      await expect(store.get('test:ping')).rejects.toMatchObject({
        code: AuthErrorCode.SESSION_STORE_UNAVAILABLE,
      })
    })
  })

  describe('set', () => {
    it('calls Redis with correct key, value and TTL', async () => {
      mockRedis.set.mockResolvedValue('OK')
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      await store.set('test:ping', 'pong', 60)
      expect(mockRedis.set).toHaveBeenCalledWith('test:ping', 'pong', 'EX', 60)
    })

    it('throws SESSION_STORE_UNAVAILABLE when Redis fails', async () => {
      mockRedis.set.mockRejectedValue(new Error('connection lost'))
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      await expect(store.set('test:ping', 'pong', 60)).rejects.toThrow(
        AuthError,
      )
      await expect(store.set('test:ping', 'pong', 60)).rejects.toMatchObject({
        code: AuthErrorCode.SESSION_STORE_UNAVAILABLE,
      })
    })
  })

  describe('delete', () => {
    it('calls Redis del with the correct key', async () => {
      mockRedis.del.mockResolvedValue(1)
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      await store.delete('test:ping')
      expect(mockRedis.del).toHaveBeenCalledWith('test:ping')
    })

    it('throws SESSION_STORE_UNAVAILABLE when Redis fails', async () => {
      mockRedis.del.mockRejectedValue(new Error('connection lost'))
      const store = createRedisStore({ host: 'localhost', port: 6379 })
      await expect(store.delete('test:ping')).rejects.toThrow(AuthError)
      await expect(store.delete('test:ping')).rejects.toMatchObject({
        code: AuthErrorCode.SESSION_STORE_UNAVAILABLE,
      })
    })
  })
})
