import type { User } from './session.types'

export interface FieldConfig {
  name: string
  type: 'email' | 'password' | 'text' | 'number' | 'select'
  label: string
  placeholder?: string
  required?: boolean
  validate?: (value: string) => string | null
  showOn?: 'login' | 'register' | 'both'
}

export interface EndpointsConfig {
  login: string
  logout: string
  register: string
  me: string
  oauthCallback: string
}

export type ResponseAdapter = (response: unknown) => {
  success: boolean
  user?: User
  fieldErrors?: Record<string, string>
  formError?: string
}
