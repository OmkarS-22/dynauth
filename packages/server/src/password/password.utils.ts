export interface PasswordRules {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumber?: boolean
  requireSymbol?: boolean
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(
  plain: string,
  rules: PasswordRules,
): ValidationResult {
  const errors: string[] = []

  if (rules.minLength && plain.length < rules.minLength) {
    errors.push(
      `Password must be at least ${String(rules.minLength)} characters`,
    )
  }
  if (rules.requireUppercase && !/[A-Z]/.test(plain)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (rules.requireLowercase && !/[a-z]/.test(plain)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (rules.requireNumber && !/[0-9]/.test(plain)) {
    errors.push('Password must contain at least one number')
  }
  if (rules.requireSymbol && !/[^a-zA-Z0-9]/.test(plain)) {
    errors.push('Password must contain at least one symbol')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
