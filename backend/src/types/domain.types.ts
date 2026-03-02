// Tipos del dominio de negocio: reglas de competencias, ligas y torneos
import { Competition, Event, Player, EventType, Match, Club, CompetitionType, Season } from '@prisma/client'

// ============================================
// TIPOS BASE PARA CONFIGURACIÓN DE LIGAS
// ============================================

type LeaguePlayoffType = 'TOP_3_FINALS' | 'TOP_4_CROSS'
type LeaguePlayoutType = '5_VS_6' | '4_VS_5'
type LeaguePosition = 'TOP' | 'MIDDLE' | 'BOTTOM'
type competitionCategory = 'SENIOR' | 'KEMPESITA'

type matchIndexes = {
  a_team_rank_index: number
  b_team_rank_index: number
}

// ============================================
// CONFIGURACIÓN DE CAMPEONATO (Liga A)
// ============================================

// Formato para determinar el campeón
export type ChampionshipFormat = 'FIRST_PLACE' | 'LIGUILLA' | 'TRIANGULAR'

// Configuración de liguilla: mini liga entre los X primeros
// Usamos type con index signature para compatibilidad con Prisma JSON
export type LiguillaConfig = {
  format: 'LIGUILLA'
  teamsCount: number        // Cuántos equipos participan (ej: 4)
  keepPoints: boolean       // Mantienen puntos de fase regular (true por defecto)
  roundType: 'match' | 'match_and_rematch'  // Solo ida o ida y vuelta
  [key: string]: unknown    // Index signature para Prisma JSON
}

// Configuración de triangular: Semi (3° vs 2°), Final (Ganador vs 1°)
export type TriangularConfig = {
  format: 'TRIANGULAR'
  // Posiciones finales: Campeón (ganador final), Sub (perdedor final), 3° (perdedor semi)
  [key: string]: unknown    // Index signature para Prisma JSON
}

// Unión de configuraciones de campeonato
export type ChampionshipConfig = 
  | { format: 'FIRST_PLACE'; [key: string]: unknown }  // El 1ro de la tabla es campeón
  | LiguillaConfig
  | TriangularConfig

// ============================================
// CONFIGURACIÓN DE PLAYOUT (pelea por no descender)
// ============================================

export type PlayoutConfig = {
  positions: number[]       // Posiciones que participan, ej: [5, 6] para 5to vs 6to
  loserGoesToPromotion: boolean  // El perdedor va a promoción
  loserFinalPosition: number     // Posición final del perdedor (ej: 6)
  [key: string]: unknown    // Index signature para Prisma JSON
}

// ============================================
// CONFIGURACIÓN DE REDUCIDO (última división)
// ============================================

export type ReducidoConfig = {
  // Primera ronda: los 2 equipos peor clasificados que entran al reducido
  // Ej: [7, 8] para 7mo vs 8vo
  startPositions: [number, number]
  // Posiciones de equipos que esperan en cada ronda siguiente, en orden
  // Ej: [6, 5, 4, 3] → Ronda 2: 6to vs Ganador R1, Ronda 3: 5to vs Ganador R2, etc.
  // Cantidad variable: permite desde 1 ronda extra hasta N rondas
  waitingPositions: number[]
  // El ganador de la última ronda va a promoción inter-división
  winnerGoesToPromotion: boolean
  [key: string]: unknown    // Index signature para Prisma JSON
}

// ============================================
// REGLAS DE LIGAS POR POSICIÓN
// ============================================

export type TopLeagueRules = {
  active_league: CompetitionType
  league_position: 'TOP'
  roundType: 'match' | 'match_and_rematch'
  clubIds: string[] // IDs de los clubes participantes
  // Configuración de campeonato
  championship: ChampionshipConfig
  // Playout opcional (ej: 5to vs 6to, perdedor va a promoción)
  playout?: PlayoutConfig
  // Descensos
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    promotion?: { quantity: number; teams_index: number[] }  // Equipos que van a promoción
  }
}

export type MiddleLeagueRules = {
  active_league: CompetitionType
  league_position: 'MIDDLE'
  roundType: 'match' | 'match_and_rematch'
  clubIds: string[] // IDs de los clubes participantes
  // Playout opcional
  playout?: PlayoutConfig
  // Ascensos
  promotions: {
    direct: { quantity: number; teams_index: number[] }
    playoff?: { quantity: number; teams_index: number[] }  // Equipos que van a promoción vs división superior
  }
  // Descensos
  relegations: {
    direct: { quantity: number; teams_index: number[] }
    promotion?: { quantity: number; teams_index: number[] }
  }
}

export type BottomLeagueRules = {
  active_league: CompetitionType
  league_position: 'BOTTOM'
  roundType: 'match' | 'match_and_rematch'
  clubIds: string[] // IDs de los clubes participantes
  // Ascensos
  promotions: {
    direct: { quantity: number; teams_index: number[] }
    playoff?: { quantity: number; teams_index: number[] }
  }
  // Reducido para pelear promoción
  reducido?: ReducidoConfig
  // No hay descensos en la última división (o sí si hay inactivos)
  relegations?: {
    direct: { quantity: number; teams_index: number[] }
  }
}

export type CompetitionRules = LeaguesRules | KempesCupRules | CindorCupRules | SuperCupRules

export type LeaguesRules = {
  type: 'LEAGUES'
  activeSeason: Season
  competitionCategory: competitionCategory
  leagues: Array<TopLeagueRules | MiddleLeagueRules | BottomLeagueRules>
}

// Grupo de copa con equipos asignados
export type CupGroup = {
  groupName: string    // 'A', 'B', 'C', etc.
  clubIds: string[]    // IDs de los clubes en este grupo
  [key: string]: unknown    // Index signature para Prisma JSON
}

export type KempesCupRules = {
  type: 'KEMPES_CUP' | 'CUP'  // 'CUP' for backward compatibility with existing data
  activeSeason: Season
  competitionCategory: competitionCategory
  competitionType: CompetitionType
  numGroups: number
  teamsPerGroup: number
  qualifyToGold: number
  qualifyToSilver: number
  groups?: CupGroup[]  // Grupos con equipos asignados (opcional, se llena en paso 2)
}

// Copa Cindor: Eliminación directa para todos los Kempesitas
export type CindorCupRules = {
  type: 'CINDOR_CUP'
  activeSeason: Season
  competitionCategory: 'KEMPESITA'  // Siempre Kempesita
  competitionType: CompetitionType
  teamIds: string[]  // IDs de los equipos participantes (todos los Kempesitas activos)
}

// Supercopa: Eliminación directa con 6 equipos elegidos por el admin
// La Supercopa NO tiene categoría porque participan Mayores y Kempesitas juntos
export type SuperCupRules = {
  type: 'SUPER_CUP'
  activeSeason: Season
  // Sin competitionCategory - la Supercopa es mixta
  competitionType: CompetitionType
  teamIds: string[]  // Exactamente 6 equipos elegidos por el admin
}

// ============================================
// TIPOS PARA STANDINGS (TABLAS DE POSICIONES)
// ============================================

export type TeamStanding = {
  clubId: string
  clubName: string
  clubLogo?: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  position: number
  // Zona de la tabla (para colorear en UI)
  zone?: 'champion' | 'liguilla' | 'triangular'
    | 'promotion' | 'promotion_playoff'
    | 'playout' | 'relegation' | 'relegation_playoff'
    | 'reducido' | 'playoff'
    | 'gold_cup' | 'silver_cup' | null
  [key: string]: unknown    // Index signature para Prisma JSON
}

export type CompetitionStandings = {
  competitionId: string
  competitionName: string
  seasonNumber: number
  standings: TeamStanding[]
  isComplete: boolean  // Todos los partidos finalizados/cancelados
  matchesPlayed: number
  matchesTotal: number
  leaguePosition?: 'TOP' | 'MIDDLE' | 'BOTTOM' | null  // Posicion en jerarquia de ligas
  activeZones?: string[]  // Zonas presentes en esta tabla (para leyenda dinamica)
  [key: string]: unknown    // Index signature para Prisma JSON
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
