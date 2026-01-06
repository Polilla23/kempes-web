export class EventTypeNotFoundError extends Error {
  constructor(message = 'Event type not found.') {
    super(message)
    this.name = 'EventTypeNotFoundError'
  }
}

export class EventTypeAlreadyExistsError extends Error {
  constructor(message = 'Event type already exists.') {
    super(message)
    this.name = 'EventTypeAlreadyExistsError'
  }
}