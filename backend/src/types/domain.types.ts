// Tipos del dominio de negocio: reglas de competencias, ligas y torneos
import { Competition, Event, Player, EventType, Match, Club, CompetitionType, Season } from '@prisma/client'

type LeaguePlayoffType = 'TOP_3_FINALS' | 'TOP_4_CROSS'
type LeaguePlayoutType = '5_VS_6' | '4_VS_5'
type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'
type competitionCategory = 'SENIOR' | 'KEMPESITA'

type matchIndexes = {
  a_team_rank_index: number
  b_team_rank_index: number
}

export type TopLeagueRules = {
  active_league: CompetitionType
  league_position: LeaguePosition
  firstIsChampion: boolean
  roundType: 'match' | 'match_and_rematch'
  clubIds: string[] // IDs de los clubes participantes
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
  clubIds: string[] // IDs de los clubes participantes
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
  clubIds: string[] // IDs de los clubes participantes
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

export type CompetitionWithType = Competition & {
  competitionType: CompetitionType
  _count?: {
    matches: number
    clubs: number
  }
}

export type EventWithRelations = Event & {
  player: Player
  type: EventType
  match: Match & {
    homeClub: Club | null
    awayClub: Club | null
  }
}
