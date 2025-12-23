export function validateNumber(value: any, min: number = 0, max?: number): number {
  const num = Number(value)
  if (isNaN(num)) throw new Error(`Invalid number: ${value}`)
  if (num < min) throw new Error(`Value must be >= ${min}`)
  if (max && num > max) throw new Error(`Value must be <= ${max}`)
  return num
}

export function validateBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase()
    if (['true', '1', 'yes'].includes(lower)) return true
    if (['false', '0', 'no'].includes(lower)) return false
  }
  throw new Error(`Invalid boolean value: ${value}`)
}

export function validateString(value: any, minLength: number = 0, maxLength?: number): string {
  const str = String(value).trim()
  if (str.length < minLength) throw new Error(`String must be at least ${minLength} characters`)
  if (maxLength && str.length > maxLength) throw new Error(`String must be at most ${maxLength} characters`)
  return str
}

export function validateEmail(value: any): string {
  const str = validateString(value)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(str)) throw new Error(`Invalid email address: ${value}`)
  return str
}

export function validateUUID(value: any): string {
  const str = String(value).trim()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(str)) throw new Error(`Invalid UUID: ${value}`)
  return str
}

export function validateUrl(value: any, options?: { require_protocol?: boolean }): string {
  const str = String(value).trim()
  try {
    const url = new URL(str)
    if (options?.require_protocol && !['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`URL must start with http:// or https://: ${value}`)
    }
    return str
  } catch {
    throw new Error(`Invalid URL: ${value}`)
  }
}

export const Validator = {
  number: validateNumber,
  boolean: validateBoolean,
  string: validateString,
  email: validateEmail,
  uuid: validateUUID,
  url: validateUrl,
}
