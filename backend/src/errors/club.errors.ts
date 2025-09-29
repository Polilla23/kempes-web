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
