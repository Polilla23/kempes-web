export class SeasonHalfNotFoundError extends Error {
  constructor() {
    super('Season half not found')
    this.name = 'SeasonHalfNotFoundError'
  }
}

export class SeasonHalfAlreadyExistsError extends Error {
  constructor() {
    super('Season halves already exist for this season')
    this.name = 'SeasonHalfAlreadyExistsError'
  }
}

export class NoActiveSeasonHalfError extends Error {
  constructor() {
    super('No active season half found')
    this.name = 'NoActiveSeasonHalfError'
  }
}

export class InvalidSeasonHalfTransitionError extends Error {
  constructor(message: string = 'Invalid season half transition') {
    super(message)
    this.name = 'InvalidSeasonHalfTransitionError'
  }
}
