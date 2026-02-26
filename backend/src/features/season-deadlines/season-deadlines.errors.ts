export class SeasonDeadlineNotFoundError extends Error {
  constructor() {
    super('Season deadline not found')
    this.name = 'SeasonDeadlineNotFoundError'
  }
}
