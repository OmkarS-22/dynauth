import { v4 as uuidv4 } from 'uuid'

import { deserializeSession, serializeSession } from './utils/session.helpers'

import type { RedisStoreClient } from '../session/redis.store'
import type { SessionRecord } from '../session/session.types'
import type { ServerConfig } from '../types/config.types'

interface SessionService {
  createSession: (
    userId: string,
    meta: Pick<SessionRecord, 'userAgent' | 'ipAddress' | 'authMethod'>,
  ) => Promise<SessionRecord>
  getSession: (sessionId: string) => Promise<SessionRecord | null>
  deleteSession: (sessionId: string) => Promise<void>
  touchSession: (sessionId: string) => Promise<void>
}

export function createSessionService(
  config: ServerConfig,
  store: RedisStoreClient,
): SessionService {
  async function createSession(
    userId: string,
    meta: Pick<SessionRecord, 'userAgent' | 'ipAddress' | 'authMethod'>,
  ): Promise<SessionRecord> {
    const sessionId = uuidv4()
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + config.session.ttl * 1000)

    const record: SessionRecord = {
      sessionId,
      userId,
      createdAt,
      expiresAt,
      lastActiveAt: createdAt,
      authMethod: meta.authMethod,
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      provider: null,
      ...(meta.userAgent !== undefined && { userAgent: meta.userAgent }),
      ...(meta.ipAddress !== undefined && { ipAddress: meta.ipAddress }),
    }

    const serialized = serializeSession(record)

    await store.set(`session:${sessionId}`, serialized, config.session.ttl)

    return record
  }

  async function getSession(sessionId: string): Promise<SessionRecord | null> {
    const session = await store.get(`session:${sessionId}`)

    if (session) {
      const deserialized = deserializeSession(session)
      if (deserialized.expiresAt < new Date()) {
        await store.delete(`session:${sessionId}`)
        return null
      }
      return deserialized
    }

    return null
  }

  async function deleteSession(sessionId: string): Promise<void> {
    await store.delete(`session:${sessionId}`)
  }

  async function touchSession(sessionId: string): Promise<void> {
    const session = await getSession(sessionId)

    if (!session) return

    const lastActiveAt = new Date()
    const expiry = new Date(lastActiveAt.getTime() + config.session.ttl * 1000)

    const updated = {
      ...session,
      lastActiveAt,
      expiresAt: config.session.rolling ? expiry : session.expiresAt,
    }

    const serialized = serializeSession(updated)

    const ttl = config.session.rolling
      ? config.session.ttl
      : Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)

    if (ttl <= 0) {
      await store.delete(`session:${sessionId}`)
      return
    }

    await store.set(`session:${sessionId}`, serialized, ttl)
  }

  return {
    createSession,
    getSession,
    deleteSession,
    touchSession,
  }
}
