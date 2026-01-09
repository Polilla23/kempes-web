export class SalaryRateNotFoundError extends Error {
  constructor() {
    super('Salary rate not found')
    this.name = 'SalaryRateNotFoundError'
  }
}

export class SalaryRateOverlapError extends Error {
  constructor() {
    super('Salary rate range overlaps with existing rate')
    this.name = 'SalaryRateOverlapError'
  }
}

export class InvalidRangeError extends Error {
  constructor() {
    super('Min overall must be less than or equal to max overall')
    this.name = 'InvalidRangeError'
  }
}
