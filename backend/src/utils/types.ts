import 'fastify'
import { AwilixContainer } from 'awilix'
import { Competition, CompetitionType, RoleType, Season } from '@prisma/client'
import { JWT } from '@fastify/jwt'

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

export type RegisterUserInput = {
  email: string
  password: string
  role?: RoleType
}

export type RegisterClubInput = {
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

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

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
