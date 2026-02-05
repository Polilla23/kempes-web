export class FinancialTransactionNotFoundError extends Error {
  constructor() {
    super('Financial transaction not found')
    this.name = 'FinancialTransactionNotFoundError'
  }
}

export class ClubSeasonBalanceNotFoundError extends Error {
  constructor() {
    super('Club season balance not found')
    this.name = 'ClubSeasonBalanceNotFoundError'
  }
}

export class CompetitionPrizeNotFoundError extends Error {
  constructor() {
    super('Competition prize not found')
    this.name = 'CompetitionPrizeNotFoundError'
  }
}

export class InsufficientBalanceError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`)
    this.name = 'InsufficientBalanceError'
  }
}

export class DuplicatePrizePositionError extends Error {
  constructor(competitionTypeId: string, position: number) {
    super(`Prize for position ${position} already exists for competition type ${competitionTypeId}`)
    this.name = 'DuplicatePrizePositionError'
  }
}

export class InvalidAmountError extends Error {
  constructor(message: string = 'Invalid amount') {
    super(message)
    this.name = 'InvalidAmountError'
  }
}
