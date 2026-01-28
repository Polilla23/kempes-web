export class NewsNotFoundError extends Error {
  constructor() {
    super('News not found')
    this.name = 'NewsNotFoundError'
  }
}

export class UnauthorizedNewsAccessError extends Error {
  constructor() {
    super('You do not have permission to access or modify this news')
    this.name = 'UnauthorizedNewsAccessError'
  }
}

export class InvalidNewsDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidNewsDataError'
  }
}
