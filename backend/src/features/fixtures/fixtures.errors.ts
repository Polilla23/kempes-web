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

export class UserNotClubOwnerError extends Error {
  constructor(message = 'User does not own any club participating in this match.') {
    super(message)
    this.name = 'UserNotClubOwnerError'
  }
}

export class GoalEventsMismatchError extends Error {
  constructor(team: string, expected: number, got: number) {
    super(`Goal events for ${team} (${got}) do not match the score (${expected}).`)
    this.name = 'GoalEventsMismatchError'
  }
}

export class MvpRequiredError extends Error {
  constructor(message = 'MVP player selection is required.') {
    super(message)
    this.name = 'MvpRequiredError'
  }
}
