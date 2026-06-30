import { comparePassword, hashPassword } from './password.service'

describe('hashPassword', () => {
  it('returns a bcrypt hash', async () => {
    const hash = await hashPassword('myPassword', 10)
    expect(hash).toMatch(/^\$2b\$/)
  })
})

describe('comparePassword', () => {
  it('returns true when the password matches the hash', async () => {
    const hash = await hashPassword('myPassword', 10)
    const result = await comparePassword('myPassword', hash)
    expect(result).toBe(true)
  })

  it('returns false when the password does not match the hash', async () => {
    const hash = await hashPassword('myPassword', 10)
    const result = await comparePassword('wrongPassword', hash)
    expect(result).toBe(false)
  })
})
