export const enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  SESSION_STORE_UNAVAILABLE = 'SESSION_STORE_UNAVAILABLE',
}

type ErrorRegistry = Record<
  AuthErrorCode,
  { httpStatus: number; retryable: boolean; field?: string }
>

const errorRegistry: ErrorRegistry = {
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    httpStatus: 401,
    retryable: false,
  },
  [AuthErrorCode.ACCOUNT_NOT_FOUND]: {
    httpStatus: 404,
    retryable: false,
  },
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: {
    httpStatus: 409,
    retryable: false,
    field: 'email',
  },
  [AuthErrorCode.PASSWORD_TOO_WEAK]: {
    httpStatus: 422,
    retryable: false,
    field: 'password',
  },
  [AuthErrorCode.SESSION_EXPIRED]: {
    httpStatus: 401,
    retryable: false,
  },
  [AuthErrorCode.SESSION_INVALID]: {
    httpStatus: 401,
    retryable: false,
  },
  [AuthErrorCode.TOO_MANY_ATTEMPTS]: {
    httpStatus: 429,
    retryable: true,
  },
  [AuthErrorCode.SESSION_STORE_UNAVAILABLE]: {
    httpStatus: 503,
    retryable: true,
  },
}

export class AuthError extends Error {
  code: AuthErrorCode
  httpStatus: number
  retryable: boolean
  field?: string | undefined

  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
    this.code = code

    const meta = errorRegistry[code]
    this.httpStatus = meta.httpStatus
    this.retryable = meta.retryable
    this.field = meta.field
  }
}
