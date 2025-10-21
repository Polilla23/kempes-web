export class MatchNotFoundError extends Error {
  constructor(message = 'Match not found.') {
    super(message)
    this.name = 'MatchNotFoundError'
  }
}

export class MatchAlreadyFinalizedError extends Error {
  constructor(message = 'Match already finalized.') {
    super(message)
    this.name = 'MatchAlreadyFinalizedError'
  }
}

export class MatchNotAssignedError extends Error {
  constructor(message = 'Both teams must be assigned before finishing the match.') {
    super(message)
    this.name = 'MatchNotAssignedError'
  }
}

export class KnockoutMatchDrawError extends Error {
  constructor(message = 'Knockout matches cannot end in a draw.') {
    super(message)
    this.name = 'KnockoutMatchDrawError'
  }
}
