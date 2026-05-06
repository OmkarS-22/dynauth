import { hash, compare, genSalt } from 'bcrypt'

export async function hashPassword(
  plain: string,
  saltRounds = 10,
): Promise<string> {
  const salt = await genSalt(saltRounds)
  return hash(plain, salt)
}

export async function comparePassword(
  plain: string,
  storedHash: string,
): Promise<boolean> {
  return compare(plain, storedHash)
}
