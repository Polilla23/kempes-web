import 'fastify'
import { AwilixContainer } from 'awilix'
import {
  CompetitionCategory,
  CompetitionFormat,
  CompetitionName,
  CompetitionType,
  RoleType,
  Season,
} from '@prisma/client'
import { JWT } from '@fastify/jwt'

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// FASTIFY TOKEN TYPES
declare global {
  namespace Fastify {
    interface FastifyRequest {
      user: {
        id: string
        role: string
      }
    }
  }
}
declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }

  interface FastifyInstance {
    container: AwilixContainer
    authenticate: any
    jwt: JWT
  }
}
declare module '@fastify/jwt' {
  interface fastifyJwt {
    payload: {
      id: string
      role: string
    }
  }
}

export interface Token {
  access_token: string
  token_type: string
  expires_in: number
}

// INPUT TYPES
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

// tournament rules json types

//ENUMS
type LeaguePlayoffType = 'TOP_3_FINALS' | 'TOP_4_CROSS'

type LeaguePlayoutType = '5_VS_6' | '4_VS_5'

type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'

type matchIndexes = {
  a_team_rank_index: number
  b_team_rank_index: number
}

type competitionCategory = 'SENIOR' | 'KEMPESITA'

// TYPES
export type TopLeagueRules = {
  active_league: CompetitionType
  league_position: LeaguePosition
  firstIsChampion: boolean
  roundType: 'match' | 'match_and_rematch'
  topPlayoffs?: { type: LeaguePlayoffType; teams_index: number[] }
  playouts?: { type: LeaguePlayoutType; teams_index: number[] }
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: matchIndexes[] }
  }
}

export type MiddleLeagueRules = {
  active_league: CompetitionType
  league_position: LeaguePosition
  roundType: 'match' | 'match_and_rematch'
  playouts?: { type: LeaguePlayoutType; teams_index: number[] }
  promotions: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: matchIndexes[] }
  }
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: matchIndexes[] }
  }
}

export type BottomLeagueRules = {
  active_league: CompetitionType
  league_position: LeaguePosition
  roundType: 'match' | 'match_and_rematch'
  promotions: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: matchIndexes[] }
  }
  playons: {
    direct_to_final_team_index: number
    direct_to_semifinal_team_index: number
    quarterfinal_teams_index: number[]
  }
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    playoffs?: { quantity: number; matches: matchIndexes[] }
  }
}

export type CompetitionRules = LeaguesRules | KempesCupRules

export type LeaguesRules = {
  type: 'LEAGUES'
  activeSeason: Season
  competitionCategory: competitionCategory
  leagues: Array<TopLeagueRules | MiddleLeagueRules | BottomLeagueRules>
}

export type KempesCupRules = {
  type: 'CUP'
  activeSeason: Season
  competitionCategory: competitionCategory
  competitionType: CompetitionType
  numGroups: number
  teamsPerGroup: number
  qualifyToGold: number
  qualifyToSilver: number
}

export type BracketMatch = {
  round: 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL'
  position: number // Position within the round (1-8 for R16, 1-4 for QF, 1-2 for SF, 1 for Final)

  homeTeam: BracketClub
  awayTeam: BracketClub
}

export type BracketClub = {
  type: 'DIRECT' | 'FROM_MATCH' | 'FROM_GROUP'

  // Used when type === 'DIRECT'
  clubId?: string

  // Used when type === 'FROM_MATCH'
  sourceRound?: 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL'
  sourcePosition?: number // Position in source round
  sourceClubPosition?: 'WINNER' | 'LOSER'

  // Used when type === 'FROM_GROUP'
  groupReference?: string // e.g., 'GROUP_A_1' for 1st place in Group A
}

export type GroupStageFixtureInput = {
  competitionId: string
  groups: Array<{
    groupName: string // "GROUP_A", "GROUP_B", etc.
    clubIds: string[] // List of club IDs in the group
  }>
}

export type LeagueFixtureInput = {
  competitionId: string
  clubIds: string[] // List of club IDs participating in the league
  roundType: 'match' | 'match_and_rematch'
}

export type FinishMatchInput = {
  matchId: string
  homeClubGoals: number
  awayClubGoals: number
  // TODO: Agregar detalles de goles, asistencias, tarjetas, etc.
}

export type FinishMatchResponse = {
  success: boolean
  match: any // The finished match
  dependentMatchesUpdated: number
  updatedMatches: any[] // Matches that got updated with winners/losers
}

export type GroupStageFixtureResponse = {
  success: boolean
  matchesCreated: number
  competitionId: string
}

export type LeagueFixtureResponse = {
  success: boolean
  matchesCreated: number
  competitionId: string
}

export type KnockoutFixtureInput = {
  competitionId: string
  brackets: BracketMatch[]
}

export type KnockoutFixtureResponse = {
  success: boolean
  matchesCreated: number
  competitionId: string
}
