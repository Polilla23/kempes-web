export class PlazoNotFoundError extends Error {
  constructor() {
    super('Plazo not found')
    this.name = 'PlazoNotFoundError'
  }
}

export class DuplicatePlazoOrderError extends Error {
  constructor() {
    super('A plazo with this order already exists for this season half')
    this.name = 'DuplicatePlazoOrderError'
  }
}

export class InvalidPlazoScopeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidPlazoScopeError'
  }
}
