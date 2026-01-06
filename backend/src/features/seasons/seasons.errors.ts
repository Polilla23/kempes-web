export class SeasonNotFoundError extends Error {
  constructor(message = 'Season not found.') {
    super(message)
    this.name = 'SeasonNotFoundError'
  }
}

export class SeasonAlreadyExistsError extends Error {
  constructor(message = 'Season with this number already exists.') {
    super(message)
    this.name = 'SeasonAlreadyExistsError'
  }
}

export class ActiveSeasonAlreadyExistsError extends Error {
  constructor(message = 'There is already an active season. Deactivate it first.') {
    super(message)
    this.name = 'ActiveSeasonAlreadyExistsError'
  }
}
