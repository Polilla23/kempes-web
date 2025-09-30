export class CompetitionTypeAlreadyExistsError extends Error {
  constructor(message = 'Competition type already exists.') {
    super(message)
    this.name = 'CompetitionTypeAlreadyExistsError'
  }
}

export class CompetitionTypeNotFoundError extends Error {
  constructor(message = 'Competition type not found.') {
    super(message)
    this.name = 'CompetitionTypeNotFoundError'
  }
}
