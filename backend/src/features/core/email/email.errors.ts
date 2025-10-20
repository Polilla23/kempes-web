export class EmailAlreadyVerifiedError extends Error {
  constructor(message = 'Email already verified.') {
    super(message)
    this.name = 'EmailAlreadyVerifiedError'
  }
}

export class EmailNotVerifiedError extends Error {
  constructor(message = 'Email not verified.') {
    super(message)
    this.name = 'EmailNotVerifiedError'
  }
}

export class EmailPasswordSendError extends Error {
  constructor(message = 'Failed to send password reset email.') {
    super(message)
    this.name = 'EmailPasswordSendError'
  }
}

export class EmailSendError extends Error {
  constructor(message = 'Failed to send verification email. Please try registering again.') {
    super(message)
    this.name = 'EmailSendError'
  }
}
