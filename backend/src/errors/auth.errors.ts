export class AuthenticationError extends Error {
  constructor(message = 'Invalid email or password.') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class GenerateTokenError extends Error {
  constructor(message = 'Failed to generate token.') {
    super(message)
    this.name = 'GenerateTokenError'
  }
}

export class InvalidTokenError extends Error {
  constructor(message = 'Invalid or expired token.') {
    super(message)
    this.name = 'InvalidTokenError'
  }
}

export class SamePasswordError extends Error {
  constructor(message = 'Invalid new password. The password must be different from the old one.') {
    super(message)
    this.name = 'SamePasswordError'
  }
}
