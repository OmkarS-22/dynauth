import { describe, expect, it } from 'vitest'

import { deserializeSession, serializeSession } from './session.helpers'

import type { SessionRecord } from '../../session/session.types'

describe('session helpers', () => {
  it('round-trips a full SessionRecord with dates intact', () => {
    const record: SessionRecord = {
      sessionId: 'session-full',
      userId: 'user-1',
      createdAt: new Date('2026-09-16T10:00:00.000Z'),
      expiresAt: new Date('2026-09-23T10:00:00.000Z'),
      lastActiveAt: new Date('2026-09-16T10:30:00.000Z'),
      authMethod: 'google',
      accessToken: 'access-token',
      accessTokenExpiresAt: new Date('2026-09-16T10:15:00.000Z'),
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: new Date('2026-10-16T10:00:00.000Z'),
      provider: 'google',
      userAgent: 'Vitest Browser',
      ipAddress: '127.0.0.1',
    }

    expect(deserializeSession(serializeSession(record))).toEqual(record)
  })

  it('round-trips nullable token and provider fields as null', () => {
    const record: SessionRecord = {
      sessionId: 'session-nullable',
      userId: 'user-1',
      createdAt: new Date('2026-09-16T10:00:00.000Z'),
      expiresAt: new Date('2026-09-23T10:00:00.000Z'),
      lastActiveAt: new Date('2026-09-16T10:30:00.000Z'),
      authMethod: 'password',
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      provider: null,
    }

    const deserialized = deserializeSession(serializeSession(record))

    expect(deserialized.accessToken).toBeNull()
    expect(deserialized.accessTokenExpiresAt).toBeNull()
    expect(deserialized.refreshToken).toBeNull()
    expect(deserialized.refreshTokenExpiresAt).toBeNull()
    expect(deserialized.provider).toBeNull()
  })

  it('deserializes core timestamps as Date instances', () => {
    const record: SessionRecord = {
      sessionId: 'session-dates',
      userId: 'user-1',
      createdAt: new Date('2026-09-16T10:00:00.000Z'),
      expiresAt: new Date('2026-09-23T10:00:00.000Z'),
      lastActiveAt: new Date('2026-09-16T10:30:00.000Z'),
      authMethod: 'password',
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      provider: null,
    }

    const deserialized = deserializeSession(serializeSession(record))

    expect(deserialized.createdAt).toBeInstanceOf(Date)
    expect(deserialized.expiresAt).toBeInstanceOf(Date)
    expect(deserialized.lastActiveAt).toBeInstanceOf(Date)
  })
})
