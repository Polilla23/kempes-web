import { BadRequestError, ValidationError } from '@/features/core/errors/http-errors'

export class ClubAlreadyExistsError extends Error {
  constructor(message = 'Club already exists.') {
    super(message)
    this.name = 'ClubAlreadyExistsError'
  }
}

export class ClubNotFoundError extends Error {
  constructor(message = 'Club not found.') {
    super(message)
    this.name = 'ClubNotFoundError'
  }
}

class ClubValidationError extends ValidationError {
  constructor(message: string, details?: any) {
    super(message, details)
    this.name = 'ClubValidationError'
  }
}

class ClubCSVError extends BadRequestError {
  constructor(message: string, public readonly errors?: any[]) {
    super(message)
    this.name = 'ClubCSVError'
  }
}

class ClubDatabaseError extends BadRequestError {
  constructor(message = 'Failed to save club to database') {
    super(message)
    this.name = 'ClubDatabaseError'
  }
}

export const ClubErrors = {
  Validation: ClubValidationError,
  CSV: ClubCSVError,
  Database: ClubDatabaseError,
} as const
