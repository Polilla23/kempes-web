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
