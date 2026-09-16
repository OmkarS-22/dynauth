import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultConfig } from '../config/defaults'

import { createSessionService } from './session.service'
import { serializeSession } from './utils/session.helpers'

import type { RedisStoreClient } from '../session/redis.store'
import type { SessionRecord } from '../session/session.types'
import type { ServerConfig } from '../types/config.types'

function createMockStore(): RedisStoreClient {
  return {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }
}

function createConfig(
  overrides: Partial<ServerConfig['session']> = {},
): ServerConfig {
  return {
    ...defaultConfig,
    session: {
      ...defaultConfig.session,
      ...overrides,
    },
  }
}

function createSessionRecord(
  overrides: Partial<SessionRecord> = {},
): SessionRecord {
  const record: SessionRecord = {
    sessionId: 'session-1',
    userId: 'user-1',
    createdAt: new Date('2026-09-16T10:00:00.000Z'),
    expiresAt: new Date('2026-09-16T11:00:00.000Z'),
    lastActiveAt: new Date('2026-09-16T10:00:00.000Z'),
    authMethod: 'password',
    accessToken: null,
    accessTokenExpiresAt: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    provider: null,
    userAgent: 'Vitest Browser',
    ipAddress: '127.0.0.1',
    ...overrides,
  }

  return record
}

describe('createSessionService', () => {
  let mockStore: RedisStoreClient

  beforeEach(() => {
    mockStore = createMockStore()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('stores a serialized session with the session key and configured TTL', async () => {
      const now = new Date('2026-09-16T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const config = createConfig({ ttl: 3600 })
      const service = createSessionService(config, mockStore)

      const result = await service.createSession('user-1', {
        authMethod: 'password',
        userAgent: 'Vitest Browser',
        ipAddress: '127.0.0.1',
      })

      expect(mockStore.set).toHaveBeenCalledWith(
        `session:${result.sessionId}`,
        serializeSession(result),
        config.session.ttl,
      )
      expect(result).toMatchObject({
        userId: 'user-1',
        authMethod: 'password',
        userAgent: 'Vitest Browser',
        ipAddress: '127.0.0.1',
        accessToken: null,
        accessTokenExpiresAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        provider: null,
      })
      expect(result.sessionId).toEqual(expect.any(String))
      expect(result.createdAt).toEqual(now)
      expect(result.lastActiveAt).toEqual(now)
      expect(result.expiresAt).toEqual(
        new Date(now.getTime() + config.session.ttl * 1000),
      )
    })
  })

  describe('getSession', () => {
    it('returns null when the session key is missing', async () => {
      vi.mocked(mockStore.get).mockResolvedValue(null)
      const service = createSessionService(defaultConfig, mockStore)

      await expect(service.getSession('missing')).resolves.toBeNull()

      expect(mockStore.get).toHaveBeenCalledWith('session:missing')
    })

    it('returns a deserialized unexpired session', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-16T10:00:00.000Z'))
      const record = createSessionRecord({
        expiresAt: new Date('2026-09-16T11:00:00.000Z'),
      })
      vi.mocked(mockStore.get).mockResolvedValue(serializeSession(record))
      const service = createSessionService(defaultConfig, mockStore)

      await expect(service.getSession(record.sessionId)).resolves.toEqual(
        record,
      )
    })

    it('deletes and returns null for an expired stored session', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-16T10:00:00.000Z'))
      const record = createSessionRecord({
        sessionId: 'expired',
        expiresAt: new Date('2026-09-16T09:59:59.000Z'),
      })
      vi.mocked(mockStore.get).mockResolvedValue(serializeSession(record))
      const service = createSessionService(defaultConfig, mockStore)

      await expect(service.getSession(record.sessionId)).resolves.toBeNull()

      expect(mockStore.delete).toHaveBeenCalledWith('session:expired')
    })
  })

  describe('deleteSession', () => {
    it('deletes the session key', async () => {
      const service = createSessionService(defaultConfig, mockStore)

      await service.deleteSession('session-1')

      expect(mockStore.delete).toHaveBeenCalledWith('session:session-1')
    })
  })

  describe('touchSession', () => {
    it('extends a rolling session using the full configured TTL', async () => {
      const now = new Date('2026-09-16T10:30:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const config = createConfig({ ttl: 3600, rolling: true })
      const record = createSessionRecord({
        expiresAt: new Date('2026-09-16T11:00:00.000Z'),
      })
      vi.mocked(mockStore.get).mockResolvedValue(serializeSession(record))
      const service = createSessionService(config, mockStore)

      await service.touchSession(record.sessionId)

      const updated = {
        ...record,
        lastActiveAt: now,
        expiresAt: new Date(now.getTime() + config.session.ttl * 1000),
      }
      expect(mockStore.set).toHaveBeenCalledWith(
        `session:${record.sessionId}`,
        serializeSession(updated),
        config.session.ttl,
      )
    })

    it('preserves expiry for non-rolling sessions and uses the remaining TTL', async () => {
      const now = new Date('2026-09-16T10:30:30.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const config = createConfig({ rolling: false })
      const record = createSessionRecord({
        expiresAt: new Date('2026-09-16T10:45:30.000Z'),
      })
      vi.mocked(mockStore.get).mockResolvedValue(serializeSession(record))
      const service = createSessionService(config, mockStore)

      await service.touchSession(record.sessionId)

      const updated = {
        ...record,
        lastActiveAt: now,
      }
      expect(mockStore.set).toHaveBeenCalledWith(
        `session:${record.sessionId}`,
        serializeSession(updated),
        900,
      )
    })

    it('deletes a non-rolling session when the remaining TTL rounds down to zero', async () => {
      const now = new Date('2026-09-16T10:30:30.500Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const config = createConfig({ rolling: false })
      const record = createSessionRecord({
        expiresAt: new Date('2026-09-16T10:30:30.750Z'),
      })
      vi.mocked(mockStore.get).mockResolvedValue(serializeSession(record))
      const service = createSessionService(config, mockStore)

      await service.touchSession(record.sessionId)

      expect(mockStore.set).not.toHaveBeenCalled()
      expect(mockStore.delete).toHaveBeenCalledWith(
        `session:${record.sessionId}`,
      )
    })

    it('does not swallow store errors', async () => {
      const error = new Error('store unavailable')
      vi.mocked(mockStore.get).mockRejectedValue(error)
      const service = createSessionService(defaultConfig, mockStore)

      await expect(service.touchSession('session-1')).rejects.toThrow(error)
    })
  })
})
