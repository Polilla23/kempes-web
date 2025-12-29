import { NotFoundError, ValidationError, BadRequestError } from '@/features/core/errors/http-errors'

class PlayerNotFoundError extends NotFoundError {
  constructor(message = 'Player not found') {
    super(message)
    this.name = 'PlayerNotFoundError'
  }
}

class PlayerValidationError extends ValidationError {
  constructor(message: string, details?: any) {
    super(message, details)
    this.name = 'PlayerValidationError'
  }
}

class PlayerCSVError extends BadRequestError {
  constructor(message: string, public readonly errors?: any[]) {
    super(message)
    this.name = 'PlayerCSVError'
  }
}

class PlayerDatabaseError extends BadRequestError {
  constructor(message = 'Failed to save player to database') {
    super(message)
    this.name = 'PlayerDatabaseError'
  }
}

export const PlayerErrors = {
  NotFound: PlayerNotFoundError,
  Validation: PlayerValidationError,
  CSV: PlayerCSVError,
  Database: PlayerDatabaseError,
} as const
