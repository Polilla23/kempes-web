// Clases base para errores HTTP que el error handler puede identificar

export abstract class HttpError extends Error {
  abstract readonly statusCode: number
  abstract readonly errorCode: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400
  readonly errorCode = 'BAD_REQUEST'

  constructor(message: string = 'Bad request') {
    super(message)
  }
}

export class ValidationError extends HttpError {
  readonly statusCode = 400
  readonly errorCode = 'VALIDATION_ERROR'
  
  constructor(
    message: string = 'Validation failed',
    public readonly details?: any
  ) {
    super(message)
  }
}

export class UnauthorizedError extends HttpError {
  readonly statusCode = 401
  readonly errorCode = 'UNAUTHORIZED'

  constructor(message: string = 'Unauthorized access') {
    super(message)
  }
}

export class ForbiddenError extends HttpError {
  readonly statusCode = 403
  readonly errorCode = 'FORBIDDEN'

  constructor(message: string = 'Forbidden') {
    super(message)
  }
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404
  readonly errorCode = 'NOT_FOUND'

  constructor(message: string = 'Resource not found') {
    super(message)
  }
}

export class ConflictError extends HttpError {
  readonly statusCode = 409
  readonly errorCode = 'CONFLICT'

  constructor(message: string = 'Resource already exists') {
    super(message)
  }
}

export class InternalServerError extends HttpError {
  readonly statusCode = 500
  readonly errorCode = 'INTERNAL_ERROR'

  constructor(message: string = 'Internal server error') {
    super(message)
  }
}
