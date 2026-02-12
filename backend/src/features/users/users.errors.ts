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

export class UsernameAlreadyTakenError extends Error {
  constructor(message = 'Username is already taken.') {
    super(message)
    this.name = 'UsernameAlreadyTakenError'
  }
}
