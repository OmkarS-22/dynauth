import { validatePasswordStrength } from './password.utils'

const passwordRules = {
  minLength: 6,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
}

describe('validatedPasswordStrength', () => {
  it('returns valid: false if password length < minLength', () => {
    const result = validatePasswordStrength('Ab@1', passwordRules)
    expect(result).toEqual({
      valid: false,
      errors: [
        `Password must be at least ${String(passwordRules.minLength)} characters`,
      ],
    })
  })

  it('returns valid: false if no uppercase letter', () => {
    const result = validatePasswordStrength('codemachine@68', passwordRules)
    expect(result).toEqual({
      valid: false,
      errors: ['Password must contain at least one uppercase letter'],
    })
  })

  it('returns valid: false if no lowercase letter', () => {
    const result = validatePasswordStrength('ODMACHINE@68', passwordRules)
    expect(result).toEqual({
      valid: false,
      errors: ['Password must contain at least one lowercase letter'],
    })
  })

  it('returns valid: false if no number', () => {
    const result = validatePasswordStrength('Codemachine@', passwordRules)
    expect(result).toEqual({
      valid: false,
      errors: ['Password must contain at least one number'],
    })
  })

  it('returns valid: false if no symbol', () => {
    const result = validatePasswordStrength('Abchide68', passwordRules)
    expect(result).toEqual({
      valid: false,
      errors: ['Password must contain at least one symbol'],
    })
  })
})
