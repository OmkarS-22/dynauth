export interface User {
  id: string
  email: string
  passwordHash?: string | undefined
}

export interface AuthDbAdapter {
  findUserByEmail(email: string): Promise<User | null>
  findUserById(id: string): Promise<User | null>
  createUser(data: unknown): Promise<User>
  updateUserPassword(userId: string, hash: string): Promise<void>
  linkOAuthProvider(
    userId: string,
    provider: string,
    providerUserId: string,
  ): Promise<void>
}
