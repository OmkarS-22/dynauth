import type { SessionRecord } from '../../session/session.types'

export function serializeSession(record: SessionRecord): string {
  return JSON.stringify(record)
}

export function deserializeSession(raw: string): SessionRecord {
  const parsed = JSON.parse(raw) as SessionRecord

  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    expiresAt: new Date(parsed.expiresAt),
    lastActiveAt: new Date(parsed.lastActiveAt),
    accessTokenExpiresAt: parsed.accessTokenExpiresAt
      ? new Date(parsed.accessTokenExpiresAt)
      : null,
    refreshTokenExpiresAt: parsed.refreshTokenExpiresAt
      ? new Date(parsed.refreshTokenExpiresAt)
      : null,
  }
}
