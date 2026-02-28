export type GroupStageFixtureInput = {
  competitionId: string
  groups: Array<{
    groupName: string
    clubIds: string[]
  }>
}

export type LeagueFixtureInput = {
  competitionId: string
  clubIds: string[]
  roundType: 'match' | 'match_and_rematch'
}

export type KnockoutFixtureInput = {
  competitionId: string
  brackets: BracketMatch[]
}

export type FinishMatchInput = {
  matchId: string
  homeClubGoals: number
  awayClubGoals: number
}

export type BracketMatch = {
  round: 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL'
  position: number
  homeTeam: BracketClub
  awayTeam: BracketClub
}

export type BracketClub = {
  type: 'DIRECT' | 'FROM_MATCH' | 'FROM_GROUP'
  clubId?: string
  sourceRound?: 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL'
  sourcePosition?: number
  sourceClubPosition?: 'WINNER' | 'LOSER'
  groupReference?: string
}

export type SubmitResultEventInput = {
  typeId: string
  playerId: string
  quantity: number
}

export type SubmitResultInput = {
  matchId: string
  homeClubGoals: number
  awayClubGoals: number
  homeOwnGoals: number
  awayOwnGoals: number
  homeEvents: SubmitResultEventInput[]
  awayEvents: SubmitResultEventInput[]
  mvpPlayerId: string
  userId: string
  screenshotUrl?: string
}
