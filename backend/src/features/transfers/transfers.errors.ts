export class TransferNotFoundError extends Error {
  constructor() {
    super('Transfer not found')
    this.name = 'TransferNotFoundError'
  }
}

export class TransferWindowClosedError extends Error {
  constructor() {
    super('Cannot create transfer: transfer window is closed')
    this.name = 'TransferWindowClosedError'
  }
}

export class InsufficientBudgetError extends Error {
  constructor(available: number, required: number) {
    super(`Insufficient budget. Available: ${available}, Required: ${required}`)
    this.name = 'InsufficientBudgetError'
  }
}

export class RosterLimitExceededError extends Error {
  constructor(type: 'SENIOR' | 'KEMPESITA', current: number, max: number) {
    super(`Roster limit exceeded for ${type}. Current: ${current}, Max: ${max}`)
    this.name = 'RosterLimitExceededError'
  }
}

export class PlayerAlreadyInClubError extends Error {
  constructor() {
    super('Player already belongs to the destination club')
    this.name = 'PlayerAlreadyInClubError'
  }
}

export class PlayerOnLoanError extends Error {
  constructor() {
    super('Cannot transfer a player who is currently on loan. Return from loan first.')
    this.name = 'PlayerOnLoanError'
  }
}

export class InvalidTransferTypeError extends Error {
  constructor(message: string = 'Invalid transfer type for this operation') {
    super(message)
    this.name = 'InvalidTransferTypeError'
  }
}

export class TransferAlreadyCompletedError extends Error {
  constructor() {
    super('This transfer has already been completed')
    this.name = 'TransferAlreadyCompletedError'
  }
}

export class TransferCancelledError extends Error {
  constructor() {
    super('This transfer has been cancelled')
    this.name = 'TransferCancelledError'
  }
}

export class InstallmentNotFoundError extends Error {
  constructor() {
    super('Installment not found')
    this.name = 'InstallmentNotFoundError'
  }
}

export class InstallmentAlreadyPaidError extends Error {
  constructor() {
    super('This installment has already been paid')
    this.name = 'InstallmentAlreadyPaidError'
  }
}

export class NoActiveSeasonHalfError extends Error {
  constructor() {
    super('No active season half found')
    this.name = 'NoActiveSeasonHalfError'
  }
}

export class InvalidInstallmentCountError extends Error {
  constructor(message: string = 'Invalid number of installments') {
    super(message)
    this.name = 'InvalidInstallmentCountError'
  }
}
