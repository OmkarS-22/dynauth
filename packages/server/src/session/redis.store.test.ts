import Redis from 'ioredis'

import { defaultConfig } from '../config/defaults'

import { getRedisClient, closeRedisClient } from './redis.store'

describe('getRedisClient', () => {
  afterEach(async () => {
    await closeRedisClient()
  })

  it('returns a Redis instance', () => {
    const client = getRedisClient(defaultConfig.session.store)
    expect(client).toBeInstanceOf(Redis)
  })

  it('returns the same instance on subsequent calls', () => {
    const first = getRedisClient(defaultConfig.session.store)
    const second = getRedisClient(defaultConfig.session.store)
    expect(first).toBe(second)
  })
})
