import 'fastify'
import { AwilixContainer } from 'awilix'
import { RoleType } from '@prisma/client'
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

// tournament rules json examples and types
//
//     Ejemplo de 'rules' para LIGA A ():
// {
//       "roundType": "match_and_rematch", // 'match' o 'match_and_rematch'
//       "playoffs": { "type": "TOP_3_FINALS", "teams_index": [0, 1, 2] },
//       "playouts": { "type": "5_VS_6", "teams_index": [4, 5]},
//       "promotions": {
//         "A_vs_B": { "a_team_rank_index": -2, "b_team_rank_index": 1 },
//         "A_vs_B_playout": { "a_team_rank_index": -3, "b_team_rank_index": 2 }
//       }
//       "relegations": {
//         "direct": { "teams_index": [-1] },      }
//       }
//     }

//     Ejemplo de 'rules' para COPA KEMPES:
//     {
//       "numGroups": 5,
//       "teamsPerGroup": 8,
//       "qualifyToGold": 2, // Los 2 primeros de cada grupo a Copa de Oro
//       "qualifyToSilver": 2 // El 3ro y 4to a Copa de Plata
//     }

//ENUMS
type LeaguePlayoffType = 'TOP_3_FINALS' | 'TOP_4_CROSS'

type LeaguePlayoutType = '5_VS_6' | '4_VS_5'

type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'

type matchIndexes = {
  a_team_rank_index: number
  b_team_rank_index: number
}

export type TopLeagueRules = {
  active_league_id: string
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
  active_league_id: string
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
  active_league_id: string
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

export type LeaguesRules = {
  howManyLeagues: number
  leagues: Array<TopLeagueRules | MiddleLeagueRules | BottomLeagueRules>
}

export type KempesCupRules = {
  numGroups: number
  teamsPerGroup: number
  qualifyToGold: number
  qualifyToSilver: number
}
