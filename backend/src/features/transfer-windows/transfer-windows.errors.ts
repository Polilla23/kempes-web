export class TransferWindowNotFoundError extends Error {
  constructor() {
    super('Transfer window not found')
    this.name = 'TransferWindowNotFoundError'
  }
}

export class TransferWindowAlreadyOpenError extends Error {
  constructor() {
    super('There is already an open transfer window')
    this.name = 'TransferWindowAlreadyOpenError'
  }
}

export class NoActiveTransferWindowError extends Error {
  constructor() {
    super('No active transfer window found')
    this.name = 'NoActiveTransferWindowError'
  }
}

export class TransferWindowClosedError extends Error {
  constructor() {
    super('Transfer window is closed')
    this.name = 'TransferWindowClosedError'
  }
}

export class InvalidTransferWindowDatesError extends Error {
  constructor() {
    super('Start date must be before end date')
    this.name = 'InvalidTransferWindowDatesError'
  }
}
