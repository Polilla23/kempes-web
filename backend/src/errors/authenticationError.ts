export class AuthenticationError extends Error {
  constructor(message = 'Invalid email or password.') {
    super(message)
    this.name = 'AuthenticationError'
  }
}
