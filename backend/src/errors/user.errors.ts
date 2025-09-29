export class UserAlreadyExistsError extends Error {
  constructor(message = 'User with this email already exists.') {
    super(message)
    this.name = 'UserAlreadyExistsError'
  }
}

export class UserNotFoundError extends Error {
  constructor(message = 'User not found.') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}
