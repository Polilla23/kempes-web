export class CompetitionAlreadyExistsError extends Error {
  constructor() {
    super('Competition already exists')
    this.name = 'CompetitionAlreadyExistsError'
  }
}

export class CompetitionNotFoundError extends Error {
  constructor() {
    super('Competition not found')
    this.name = 'CompetitionNotFoundError'
  }
}
