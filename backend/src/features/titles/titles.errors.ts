export class TitleNotFoundError extends Error {
  constructor(message = 'Title not found') {
    super(message)
    this.name = 'TitleNotFoundError'
  }
}

export class TitlePointConfigNotFoundError extends Error {
  constructor(competitionName: string) {
    super(`Title point config not found for competition: ${competitionName}`)
    this.name = 'TitlePointConfigNotFoundError'
  }
}

export class InvalidCompetitionNameError extends Error {
  constructor(competitionName: string) {
    super(`Invalid competition name: ${competitionName}`)
    this.name = 'InvalidCompetitionNameError'
  }
}
