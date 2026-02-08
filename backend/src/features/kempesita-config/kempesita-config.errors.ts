import { NotFoundError, ValidationError } from '@/features/core/errors/http-errors'

class KempesitaConfigNotFoundError extends NotFoundError {
  constructor(message = 'Kempesita config not found') {
    super(message)
    this.name = 'KempesitaConfigNotFoundError'
  }
}

class KempesitaConfigValidationError extends ValidationError {
  constructor(message: string, details?: any) {
    super(message, details)
    this.name = 'KempesitaConfigValidationError'
  }
}

export const KempesitaConfigErrors = {
  NotFound: KempesitaConfigNotFoundError,
  Validation: KempesitaConfigValidationError,
} as const
