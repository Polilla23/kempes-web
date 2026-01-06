// Tipos de Input para requests del frontend

import { CompetitionCategory, CompetitionFormat, CompetitionName, RoleType } from '@prisma/client'

export type CreateUserInput = {
  email: string
  password: string
  role?: RoleType
}

export type CreateClubInput = {
  name: string
  logo?: string
  userId?: string | null
  isActive?: boolean
}

export type CreatePlayerInput = {
  name: string
  lastName: string
  birthdate: Date
  actualClubId: string
  ownerClubId: string
  overall: number
  salary: number
  sofifaId: string
  transfermarktId: string
  isKempesita: boolean
  isActive: boolean
}

export type CreateBasicPlayerInput = {
  name: string
  lastName: string
  birthdate: Date
  actualClubId?: string
  ownerClubId?: string
  overall?: number
  salary?: number
  sofifaId?: string
  transfermarktId?: string
}

export type CreateCompetitionTypeInput = {
  category: CompetitionCategory
  hierarchy: number
  name: CompetitionName
  format: CompetitionFormat
}

export type CreateEvent = {
  typeId: string
  playerId: string
  matchId: string
}

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